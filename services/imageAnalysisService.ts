import type { SupabaseClient } from '@supabase/supabase-js';
import type { ImageAnalysisResult, ProblemType, RelevantProblemType } from '../types';
import { getSupabaseClient } from './supabase';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type ImageAnalysisErrorCode =
  | 'authentication_failed'
  | 'captcha_failed'
  | 'captcha_required'
  | 'configuration_error'
  | 'empty_file'
  | 'file_too_large'
  | 'invalid_file_type'
  | 'invalid_response'
  | 'provider_unavailable'
  | 'rate_limited'
  | 'request_failed';

const VALID_PROBLEM_TYPES = new Set<ProblemType>([
  'road_damage',
  'lighting',
  'trash',
  'water',
  'parks',
  'building',
  'other',
  'none',
]);

const RELEVANT_PROBLEM_TYPES = new Set<RelevantProblemType>([
  'road_damage',
  'lighting',
  'trash',
  'water',
  'parks',
  'building',
  'other',
]);

export class ImageAnalysisError extends Error {
  readonly code: ImageAnalysisErrorCode;
  readonly retryAfterSeconds?: number;

  constructor(
    code: ImageAnalysisErrorCode,
    message: string,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'ImageAnalysisError';
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const readPositiveInteger = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : undefined;

export const validateImageFile = (imageFile: File): void => {
  if (imageFile.size === 0) {
    throw new ImageAnalysisError('empty_file', 'The selected image is empty.');
  }

  if (imageFile.size > MAX_IMAGE_BYTES) {
    throw new ImageAnalysisError(
      'file_too_large',
      `The selected image exceeds the ${MAX_IMAGE_BYTES / 1024 / 1024} MiB limit.`,
    );
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(imageFile.type as typeof ALLOWED_IMAGE_MIME_TYPES[number])) {
    throw new ImageAnalysisError(
      'invalid_file_type',
      'Only JPEG, PNG, and WebP images are accepted.',
    );
  }
};

const parseImageAnalysisResult = (parsed: unknown): ImageAnalysisResult => {
  if (!isRecord(parsed)) {
    throw new ImageAnalysisError(
      'invalid_response',
      'Image-analysis provider returned a non-object response.',
    );
  }

  if (typeof parsed.is_relevant !== 'boolean') {
    throw new ImageAnalysisError(
      'invalid_response',
      'Image-analysis response is missing is_relevant.',
    );
  }

  const problemType = parsed.problem_type;
  if (typeof problemType !== 'string' || !VALID_PROBLEM_TYPES.has(problemType as ProblemType)) {
    throw new ImageAnalysisError(
      'invalid_response',
      'Image-analysis response has an invalid problem_type.',
    );
  }

  if (!parsed.is_relevant) {
    return {
      is_relevant: false,
      relevance_reason: typeof parsed.relevance_reason === 'string'
        ? parsed.relevance_reason
        : undefined,
      problem_type: 'none',
      severity: 0,
      description: '',
      estimated_repair_cost_soles: 0,
      safety_hazard: false,
    };
  }

  if (!RELEVANT_PROBLEM_TYPES.has(problemType as RelevantProblemType)) {
    throw new ImageAnalysisError(
      'invalid_response',
      'Image-analysis response marked the image relevant without a reportable problem_type.',
    );
  }

  if (
    typeof parsed.severity !== 'number'
    || !Number.isInteger(parsed.severity)
    || parsed.severity < 1
    || parsed.severity > 5
  ) {
    throw new ImageAnalysisError(
      'invalid_response',
      'Image-analysis response has an invalid severity.',
    );
  }

  if (typeof parsed.description !== 'string' || parsed.description.trim() === '') {
    throw new ImageAnalysisError(
      'invalid_response',
      'Image-analysis response is missing a description.',
    );
  }

  if (
    typeof parsed.estimated_repair_cost_soles !== 'number'
    || !Number.isFinite(parsed.estimated_repair_cost_soles)
    || parsed.estimated_repair_cost_soles < 0
  ) {
    throw new ImageAnalysisError(
      'invalid_response',
      'Image-analysis response has an invalid repair-cost estimate.',
    );
  }

  if (typeof parsed.safety_hazard !== 'boolean') {
    throw new ImageAnalysisError(
      'invalid_response',
      'Image-analysis response is missing safety_hazard.',
    );
  }

  return {
    is_relevant: true,
    problem_type: problemType as RelevantProblemType,
    severity: parsed.severity,
    description: parsed.description,
    estimated_repair_cost_soles: parsed.estimated_repair_cost_soles,
    safety_hazard: parsed.safety_hazard,
  };
};

const getAuthenticatedClient = async (captchaToken?: string): Promise<SupabaseClient> => {
  const client = getSupabaseClient();
  if (!client) {
    throw new ImageAnalysisError(
      'configuration_error',
      'Supabase browser configuration is missing or invalid.',
    );
  }

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) {
    throw new ImageAnalysisError(
      'authentication_failed',
      'Could not verify the image-analysis session.',
    );
  }

  if (!sessionData.session) {
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
    if (turnstileSiteKey && !captchaToken) {
      throw new ImageAnalysisError(
        'captcha_required',
        'A human-verification challenge is required.',
      );
    }

    const { data, error } = await client.auth.signInAnonymously(
      captchaToken
        ? { options: { captchaToken } }
        : undefined,
    );
    if (error || !data.session) {
      throw new ImageAnalysisError(
        captchaToken ? 'captcha_failed' : 'authentication_failed',
        captchaToken
          ? 'Human verification failed.'
          : 'Could not create the image-analysis session.',
      );
    }
  }

  return client;
};

const parseFunctionError = async (error: unknown): Promise<ImageAnalysisError> => {
  if (!isRecord(error)) {
    return new ImageAnalysisError('request_failed', 'Image-analysis request failed.');
  }

  const response = error.context instanceof Response ? error.context : undefined;
  let body: Record<string, unknown> | undefined;

  if (response) {
    try {
      const parsed = await response.clone().json();
      body = isRecord(parsed) ? parsed : undefined;
    } catch {
      body = undefined;
    }
  }

  const code = typeof body?.code === 'string' ? body.code : undefined;
  const retryAfterSeconds = readPositiveInteger(body?.retry_after_seconds)
    ?? readPositiveInteger(Number(response?.headers.get('retry-after')));

  if (response?.status === 429 || code === 'rate_limited') {
    return new ImageAnalysisError(
      'rate_limited',
      'Image-analysis rate limit exceeded.',
      retryAfterSeconds,
    );
  }

  if (response?.status === 401 || response?.status === 403) {
    return new ImageAnalysisError(
      'authentication_failed',
      'Image-analysis authentication failed.',
    );
  }

  if (response?.status === 413 || code === 'file_too_large') {
    return new ImageAnalysisError(
      'file_too_large',
      `The selected image exceeds the ${MAX_IMAGE_BYTES / 1024 / 1024} MiB limit.`,
    );
  }

  if (response && response.status >= 500) {
    return new ImageAnalysisError(
      'provider_unavailable',
      'Image analysis is temporarily unavailable.',
      retryAfterSeconds,
    );
  }

  if (code === 'invalid_file_type' || code === 'invalid_image_signature') {
    return new ImageAnalysisError(
      'invalid_file_type',
      'Only valid JPEG, PNG, and WebP images are accepted.',
    );
  }

  return new ImageAnalysisError('request_failed', 'Image-analysis request failed.');
};

export const analyzeImage = async (
  imageFile: File,
  language: string = 'es',
  captchaToken?: string,
): Promise<ImageAnalysisResult> => {
  validateImageFile(imageFile);
  const client = await getAuthenticatedClient(captchaToken);
  const body = new FormData();
  body.append('image', imageFile, imageFile.name);
  body.append('language', language);

  const { data, error } = await client.functions.invoke('analyze-image', { body });
  if (error) {
    throw await parseFunctionError(error);
  }

  if (!isRecord(data) || !('analysis' in data)) {
    throw new ImageAnalysisError(
      'invalid_response',
      'Image-analysis proxy returned an invalid response.',
    );
  }

  return parseImageAnalysisResult(data.analysis);
};
