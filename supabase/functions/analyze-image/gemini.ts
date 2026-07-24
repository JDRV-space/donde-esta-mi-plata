import {
  parseAnalysisText,
  type ImageAnalysisResult,
  type SupportedLanguage,
} from './policy.ts';

const PROVIDER_TIMEOUT_MS = 30_000;
const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  es: 'Spanish',
  en: 'English',
  qu: 'Quechua',
};

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    is_relevant: { type: 'boolean' },
    relevance_reason: { type: 'string' },
    problem_type: {
      type: 'string',
      enum: [
        'road_damage',
        'lighting',
        'trash',
        'water',
        'parks',
        'building',
        'other',
        'none',
      ],
    },
    severity: { type: 'integer', minimum: 0, maximum: 5 },
    description: { type: 'string' },
    estimated_repair_cost_soles: {
      type: 'number',
      minimum: 0,
      maximum: 1_000_000_000,
    },
    safety_hazard: { type: 'boolean' },
  },
  required: [
    'is_relevant',
    'relevance_reason',
    'problem_type',
    'severity',
    'description',
    'estimated_repair_cost_soles',
    'safety_hazard',
  ],
} as const;

export class GeminiRequestError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryAfterSeconds?: number;

  constructor(
    code: string,
    status: number,
    message: string,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'GeminiRequestError';
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const encodeBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
};

const parseRetryAfter = (value: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }

  const seconds = Number(value);
  if (Number.isInteger(seconds) && seconds > 0) {
    return seconds;
  }

  const date = Date.parse(value);
  if (Number.isNaN(date)) {
    return undefined;
  }

  return Math.max(1, Math.ceil((date - Date.now()) / 1000));
};

const extractResponseText = (value: unknown): string | undefined => {
  if (typeof value !== 'object' || value === null || !('candidates' in value)) {
    return undefined;
  }

  const candidates = (value as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates)) {
    return undefined;
  }

  for (const candidate of candidates) {
    if (typeof candidate !== 'object' || candidate === null || !('content' in candidate)) {
      continue;
    }

    const content = (candidate as { content?: unknown }).content;
    if (typeof content !== 'object' || content === null || !('parts' in content)) {
      continue;
    }

    const parts = (content as { parts?: unknown }).parts;
    if (!Array.isArray(parts)) {
      continue;
    }

    for (const part of parts) {
      if (
        typeof part === 'object'
        && part !== null
        && 'text' in part
        && typeof (part as { text?: unknown }).text === 'string'
      ) {
        return (part as { text: string }).text;
      }
    }
  }

  return undefined;
};

const createPrompt = (language: SupportedLanguage): string => `
Act as a public-infrastructure and municipal-budget analyst for Lima, Peru.

First determine whether the image shows a public infrastructure, citizen service,
public cleanliness, or public safety problem. Selfies, pets, private-home
interiors, and unrelated images are not relevant.

For relevant images, classify problem_type as one of road_damage, lighting,
trash, water, parks, building, or other. Estimate severity from 1 to 5 and a
rough repair cost in Peruvian soles. For non-relevant images, use problem_type
"none", severity 0, an empty description, zero cost, and explain
relevance_reason.

Keep the technical description under 30 words and write user-facing text in
${LANGUAGE_NAMES[language]}.
`.trim();

export const requestGeminiAnalysis = async ({
  apiKey,
  bytes,
  fetcher = fetch,
  language,
  mimeType,
  model,
}: {
  apiKey: string;
  bytes: Uint8Array;
  fetcher?: typeof fetch;
  language: SupportedLanguage;
  mimeType: string;
  model: string;
}): Promise<ImageAnalysisResult> => {
  if (!/^[A-Za-z0-9._-]+$/.test(model)) {
    throw new GeminiRequestError(
      'provider_configuration_error',
      503,
      'The configured Gemini model name is invalid.',
    );
  }

  let response: Response;

  try {
    response = await fetcher(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: encodeBase64(bytes),
                  },
                },
                { text: createPrompt(language) },
              ],
            },
          ],
          generationConfig: {
            candidateCount: 1,
            maxOutputTokens: 384,
            responseMimeType: 'application/json',
            responseJsonSchema: RESPONSE_SCHEMA,
            temperature: 0.1,
          },
        }),
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      },
    );
  } catch {
    throw new GeminiRequestError(
      'provider_unavailable',
      502,
      'The Gemini request failed.',
    );
  }

  const retryAfterSeconds = parseRetryAfter(response.headers.get('retry-after'));
  if (response.status === 429) {
    throw new GeminiRequestError(
      'provider_rate_limited',
      503,
      'The Gemini project quota is temporarily exhausted.',
      retryAfterSeconds,
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new GeminiRequestError(
      'provider_configuration_error',
      503,
      'Gemini authentication failed.',
    );
  }

  if (!response.ok) {
    throw new GeminiRequestError(
      'provider_unavailable',
      502,
      'Gemini returned an unsuccessful response.',
      retryAfterSeconds,
    );
  }

  let responseBody: unknown;
  try {
    responseBody = await response.json();
  } catch {
    throw new GeminiRequestError(
      'invalid_provider_response',
      502,
      'Gemini returned invalid JSON.',
    );
  }

  const responseText = extractResponseText(responseBody);
  if (!responseText) {
    throw new GeminiRequestError(
      'invalid_provider_response',
      502,
      'Gemini returned no analysis.',
    );
  }

  return parseAnalysisText(responseText);
};
