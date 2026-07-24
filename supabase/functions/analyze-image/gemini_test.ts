import {
  assertEquals,
  assertRejects,
} from '@std/assert';
import {
  GeminiRequestError,
  requestGeminiAnalysis,
} from './gemini.ts';

const providerResult = {
  is_relevant: true,
  relevance_reason: '',
  problem_type: 'road_damage',
  severity: 3,
  description: 'Bache profundo en la pista.',
  estimated_repair_cost_soles: 1500,
  safety_hazard: true,
} as const;

const geminiResponse = (analysis: unknown): Response =>
  Response.json({
    candidates: [
      {
        content: {
          parts: [{ text: JSON.stringify(analysis) }],
        },
      },
    ],
  });

Deno.test('Gemini request keeps credentials in a server-side header and sends structured image input', async () => {
  let capturedUrl = '';
  let capturedRequest: RequestInit | undefined;
  const fetcher = (input: string | URL | Request, init?: RequestInit) => {
    capturedUrl = input.toString();
    capturedRequest = init;
    return Promise.resolve(geminiResponse(providerResult));
  };

  const result = await requestGeminiAnalysis({
    apiKey: 'server-only-key',
    bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xdb]),
    fetcher,
    language: 'es',
    mimeType: 'image/jpeg',
    model: 'gemini-2.5-flash',
  });

  assertEquals(result, {
    is_relevant: true,
    problem_type: 'road_damage',
    severity: 3,
    description: 'Bache profundo en la pista.',
    estimated_repair_cost_soles: 1500,
    safety_hazard: true,
  });
  assertEquals(
    capturedUrl,
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  );

  const headers = new Headers(capturedRequest?.headers);
  assertEquals(headers.get('x-goog-api-key'), 'server-only-key');
  assertEquals(capturedUrl.includes('server-only-key'), false);

  const body = JSON.parse(capturedRequest?.body as string);
  assertEquals(body.contents[0].parts[0].inline_data.mime_type, 'image/jpeg');
  assertEquals(body.contents[0].parts[0].inline_data.data, '/9j/2w==');
  assertEquals(body.generationConfig.responseMimeType, 'application/json');
});

Deno.test('Gemini quota failures become explicit retryable upstream errors', async () => {
  const fetcher = () => Promise.resolve(new Response(null, {
    status: 429,
    headers: { 'retry-after': '45' },
  }));

  const error = await assertRejects(
    () => requestGeminiAnalysis({
      apiKey: 'server-only-key',
      bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xdb]),
      fetcher,
      language: 'en',
      mimeType: 'image/jpeg',
      model: 'gemini-2.5-flash',
    }),
    GeminiRequestError,
  );

  assertEquals(error.code, 'provider_rate_limited');
  assertEquals(error.status, 503);
  assertEquals(error.retryAfterSeconds, 45);
});
