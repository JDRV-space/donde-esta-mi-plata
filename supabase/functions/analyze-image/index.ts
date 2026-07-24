import { createSupabaseContext } from '@supabase/server';
import {
  GeminiRequestError,
  requestGeminiAnalysis,
} from './gemini.ts';
import {
  MAX_REQUEST_BYTES,
  readBoundedRequestBody,
  RequestPolicyError,
  validateContentLength,
  validateImage,
  validateLanguage,
} from './policy.ts';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retry_after_seconds: number;
}

const RATE_LIMIT = 10;

const getAllowedOrigins = (): Set<string> =>
  new Set(
    (Deno.env.get('ALLOWED_ORIGINS') ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

const getCorsHeaders = (origin: string | null): HeadersInit => ({
  ...(origin ? { 'access-control-allow-origin': origin } : {}),
  'access-control-allow-headers': 'authorization, apikey, content-type, x-client-info',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-max-age': '86400',
  'cache-control': 'no-store',
  vary: 'Origin',
});

const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  origin: string | null,
  extraHeaders: HeadersInit = {},
): Response => Response.json(body, {
  status,
  headers: {
    ...getCorsHeaders(origin),
    ...extraHeaders,
  },
});

const getRequestOrigin = (request: Request): string | null => {
  const origin = request.headers.get('origin');
  if (!origin) {
    return null;
  }

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.size === 0) {
    throw new RequestPolicyError(
      'server_configuration_error',
      503,
      'Allowed browser origins are not configured.',
    );
  }

  if (!allowedOrigins.has(origin)) {
    throw new RequestPolicyError('origin_not_allowed', 403, 'Origin is not allowed.');
  }

  return origin;
};

const getProviderConfiguration = (): { apiKey: string; model: string } => {
  const apiKey = Deno.env.get('GEMINI_API_KEY')?.trim();
  const model = Deno.env.get('GEMINI_MODEL')?.trim();

  if (!apiKey || !model) {
    throw new RequestPolicyError(
      'server_configuration_error',
      503,
      'Image-analysis provider secrets are not configured.',
    );
  }

  return { apiKey, model };
};

const isRateLimitResult = (value: unknown): value is RateLimitResult =>
  typeof value === 'object'
  && value !== null
  && 'allowed' in value
  && typeof (value as { allowed?: unknown }).allowed === 'boolean'
  && 'remaining' in value
  && typeof (value as { remaining?: unknown }).remaining === 'number'
  && 'retry_after_seconds' in value
  && typeof (value as { retry_after_seconds?: unknown }).retry_after_seconds === 'number';

const handler = async (request: Request): Promise<Response> => {
  let origin: string | null = null;

  try {
    origin = getRequestOrigin(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse(
        { code: 'method_not_allowed', message: 'Use POST.' },
        405,
        origin,
        { allow: 'POST, OPTIONS' },
      );
    }

    validateContentLength(request.headers.get('content-length'));
    if (!(request.headers.get('content-type') ?? '').startsWith('multipart/form-data;')) {
      throw new RequestPolicyError(
        'invalid_content_type',
        415,
        'Content-Type must be multipart/form-data.',
      );
    }

    const { data: context, error: authenticationError } = await createSupabaseContext(
      request,
      { auth: 'user' },
    );
    if (authenticationError) {
      return jsonResponse(
        {
          code: authenticationError.code,
          message: authenticationError.message,
        },
        authenticationError.status,
        origin,
      );
    }

    const provider = getProviderConfiguration();
    const requestBody = await readBoundedRequestBody(request);
    let formData: FormData;
    try {
      formData = await new Request('http://multipart.local', {
        method: 'POST',
        headers: {
          'content-type': request.headers.get('content-type')!,
        },
        body: requestBody.buffer as ArrayBuffer,
      }).formData();
    } catch {
      throw new RequestPolicyError(
        'invalid_multipart_body',
        400,
        'The multipart request body is invalid.',
      );
    }

    const language = validateLanguage(formData.get('language'));
    const image = await validateImage(formData.get('image'));

    const rateLimitResponse = await context.supabase
      .rpc('consume_image_analysis_quota')
      .single();
    const rateLimitData: unknown = rateLimitResponse.data;
    const rateLimitError = rateLimitResponse.error;
    if (rateLimitError || !isRateLimitResult(rateLimitData)) {
      return jsonResponse(
        {
          code: 'rate_limit_unavailable',
          message: 'Image analysis is temporarily unavailable.',
        },
        503,
        origin,
      );
    }

    if (!rateLimitData.allowed) {
      return jsonResponse(
        {
          code: 'rate_limited',
          message: 'Image-analysis rate limit exceeded.',
          retry_after_seconds: rateLimitData.retry_after_seconds,
        },
        429,
        origin,
        {
          'retry-after': rateLimitData.retry_after_seconds.toString(),
          'x-ratelimit-limit': RATE_LIMIT.toString(),
          'x-ratelimit-remaining': '0',
        },
      );
    }

    const analysis = await requestGeminiAnalysis({
      ...provider,
      ...image,
      language,
    });

    return jsonResponse(
      { analysis },
      200,
      origin,
      {
        'x-ratelimit-limit': RATE_LIMIT.toString(),
        'x-ratelimit-remaining': rateLimitData.remaining.toString(),
      },
    );
  } catch (error) {
    if (error instanceof RequestPolicyError || error instanceof GeminiRequestError) {
      const retryAfterSeconds = 'retryAfterSeconds' in error
        ? error.retryAfterSeconds
        : undefined;

      return jsonResponse(
        {
          code: error.code,
          message: error.message,
          ...(retryAfterSeconds
            ? { retry_after_seconds: retryAfterSeconds }
            : {}),
        },
        error.status,
        origin,
        retryAfterSeconds
          ? { 'retry-after': retryAfterSeconds.toString() }
          : {},
      );
    }

    return jsonResponse(
      {
        code: 'internal_error',
        message: 'Image analysis failed.',
      },
      500,
      origin,
    );
  }
};

export default { fetch: handler };

export { MAX_REQUEST_BYTES };
