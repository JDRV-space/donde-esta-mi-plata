import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getSessionMock,
  invokeMock,
  signInAnonymouslyMock,
} = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  invokeMock: vi.fn(),
  signInAnonymouslyMock: vi.fn(),
}));

vi.mock('./supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      getSession: getSessionMock,
      signInAnonymously: signInAnonymouslyMock,
    },
    functions: {
      invoke: invokeMock,
    },
  }),
}));

import {
  analyzeImage,
  ImageAnalysisError,
  MAX_IMAGE_BYTES,
  validateImageFile,
} from './imageAnalysisService';

const validAnalysis = {
  is_relevant: true,
  problem_type: 'road_damage',
  severity: 3,
  description: 'Bache profundo en la vía.',
  estimated_repair_cost_soles: 1200,
  safety_hazard: true,
};

const createImage = (
  type = 'image/jpeg',
  bytes: BlobPart[] = [new Uint8Array([0xff, 0xd8, 0xff, 0xdb])],
) => new File(bytes, 'evidence.jpg', { type });

describe('image-analysis browser client', () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    invokeMock.mockReset();
    signInAnonymouslyMock.mockReset();
    getSessionMock.mockResolvedValue({
      data: { session: { access_token: 'user-jwt' } },
      error: null,
    });
    signInAnonymouslyMock.mockResolvedValue({
      data: { session: { access_token: 'anonymous-user-jwt' } },
      error: null,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects unsupported MIME types before making a network request', () => {
    const image = createImage('image/gif');

    expect(() => validateImageFile(image)).toThrowError(ImageAnalysisError);
    expect(() => validateImageFile(image)).toThrow('Only JPEG, PNG, and WebP');
  });

  it('rejects images larger than 5 MiB before making a network request', async () => {
    const image = createImage('image/jpeg', [new Uint8Array(MAX_IMAGE_BYTES + 1)]);

    await expect(analyzeImage(image, 'es')).rejects.toMatchObject({
      code: 'file_too_large',
    });
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it('creates an anonymous authenticated session when no session exists', async () => {
    getSessionMock.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    invokeMock.mockResolvedValue({
      data: { analysis: validAnalysis },
      error: null,
    });

    await expect(analyzeImage(createImage(), 'es')).resolves.toEqual(validAnalysis);
    expect(signInAnonymouslyMock).toHaveBeenCalledOnce();
  });

  it('requires and forwards a Turnstile token when CAPTCHA is configured', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'turnstile-site-key');
    getSessionMock.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    invokeMock.mockResolvedValue({
      data: { analysis: validAnalysis },
      error: null,
    });

    await expect(analyzeImage(createImage(), 'es')).rejects.toMatchObject({
      code: 'captcha_required',
    });
    expect(signInAnonymouslyMock).not.toHaveBeenCalled();

    await expect(
      analyzeImage(createImage(), 'es', 'turnstile-token'),
    ).resolves.toEqual(validAnalysis);
    expect(signInAnonymouslyMock).toHaveBeenCalledWith({
      options: { captchaToken: 'turnstile-token' },
    });
  });

  it('sends the original file through the authenticated Edge Function', async () => {
    const image = createImage();
    invokeMock.mockResolvedValue({
      data: { analysis: validAnalysis },
      error: null,
    });

    await analyzeImage(image, 'en');

    expect(invokeMock).toHaveBeenCalledOnce();
    expect(invokeMock.mock.calls[0][0]).toBe('analyze-image');
    const requestBody = invokeMock.mock.calls[0][1].body as FormData;
    const sentImage = requestBody.get('image') as File;
    expect(sentImage.name).toBe(image.name);
    expect(sentImage.type).toBe(image.type);
    expect(new Uint8Array(await sentImage.arrayBuffer())).toEqual(
      new Uint8Array(await image.arrayBuffer()),
    );
    expect(requestBody.get('language')).toBe('en');
  });

  it('maps explicit rate-limit responses and retry timing', async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: {
        context: new Response(
          JSON.stringify({
            code: 'rate_limited',
            retry_after_seconds: 417,
          }),
          {
            status: 429,
            headers: { 'content-type': 'application/json' },
          },
        ),
      },
    });

    await expect(analyzeImage(createImage(), 'en')).rejects.toMatchObject({
      code: 'rate_limited',
      retryAfterSeconds: 417,
    });
  });

  it('rejects malformed relevant responses instead of guessing fields', async () => {
    invokeMock.mockResolvedValue({
      data: {
        analysis: {
          is_relevant: true,
          problem_type: 'road_damage',
          severity: 3,
        },
      },
      error: null,
    });

    await expect(analyzeImage(createImage(), 'en')).rejects.toMatchObject({
      code: 'invalid_response',
    });
  });

  it('normalizes non-relevant responses so they cannot become drafts', async () => {
    invokeMock.mockResolvedValue({
      data: {
        analysis: {
          is_relevant: false,
          relevance_reason: 'Indoor photo.',
          problem_type: 'road_damage',
        },
      },
      error: null,
    });

    await expect(analyzeImage(createImage(), 'en')).resolves.toEqual({
      is_relevant: false,
      relevance_reason: 'Indoor photo.',
      problem_type: 'none',
      severity: 0,
      description: '',
      estimated_repair_cost_soles: 0,
      safety_hazard: false,
    });
  });
});
