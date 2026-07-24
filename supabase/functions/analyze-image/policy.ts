export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 64 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type SupportedLanguage = 'es' | 'en' | 'qu';
export type RelevantProblemType =
  | 'road_damage'
  | 'lighting'
  | 'trash'
  | 'water'
  | 'parks'
  | 'building'
  | 'other';

export type ImageAnalysisResult =
  | {
      is_relevant: true;
      problem_type: RelevantProblemType;
      severity: number;
      description: string;
      estimated_repair_cost_soles: number;
      safety_hazard: boolean;
    }
  | {
      is_relevant: false;
      relevance_reason: string;
      problem_type: 'none';
      severity: 0;
      description: '';
      estimated_repair_cost_soles: 0;
      safety_hazard: false;
    };

const RELEVANT_PROBLEM_TYPES = new Set<RelevantProblemType>([
  'road_damage',
  'lighting',
  'trash',
  'water',
  'parks',
  'building',
  'other',
]);

export class RequestPolicyError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = 'RequestPolicyError';
    this.code = code;
    this.status = status;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasBytes = (bytes: Uint8Array, expected: number[], offset = 0): boolean =>
  expected.every((byte, index) => bytes[offset + index] === byte);

const hasMatchingSignature = (mimeType: string, bytes: Uint8Array): boolean => {
  switch (mimeType) {
    case 'image/jpeg':
      return hasBytes(bytes, [0xff, 0xd8, 0xff]);
    case 'image/png':
      return hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/webp':
      return (
        hasBytes(bytes, [0x52, 0x49, 0x46, 0x46])
        && hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8)
      );
    default:
      return false;
  }
};

export const validateContentLength = (value: string | null): void => {
  if (value === null) {
    return;
  }

  if (!/^\d+$/.test(value)) {
    throw new RequestPolicyError(
      'invalid_content_length',
      400,
      'Content-Length must be a positive integer.',
    );
  }

  if (Number(value) > MAX_REQUEST_BYTES) {
    throw new RequestPolicyError(
      'request_too_large',
      413,
      'The request exceeds the allowed size.',
    );
  }
};

export const readBoundedRequestBody = async (request: Request): Promise<Uint8Array> => {
  if (!request.body) {
    throw new RequestPolicyError(
      'missing_request_body',
      400,
      'A multipart request body is required.',
    );
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      totalBytes += value.byteLength;
      if (totalBytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new RequestPolicyError(
          'request_too_large',
          413,
          'The request exceeds the allowed size.',
        );
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
};

export const validateLanguage = (value: FormDataEntryValue | null): SupportedLanguage => {
  if (value === null || value === 'es') {
    return 'es';
  }

  if (value === 'en' || value === 'qu') {
    return value;
  }

  throw new RequestPolicyError(
    'invalid_language',
    400,
    'Language must be es, en, or qu.',
  );
};

export const validateImage = async (
  value: FormDataEntryValue | null,
): Promise<{ bytes: Uint8Array; mimeType: string }> => {
  if (!(value instanceof File)) {
    throw new RequestPolicyError('missing_image', 400, 'An image file is required.');
  }

  if (value.size === 0) {
    throw new RequestPolicyError('empty_file', 400, 'The image file is empty.');
  }

  if (value.size > MAX_IMAGE_BYTES) {
    throw new RequestPolicyError(
      'file_too_large',
      413,
      'The image exceeds the 5 MiB limit.',
    );
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(value.type as typeof ALLOWED_IMAGE_MIME_TYPES[number])) {
    throw new RequestPolicyError(
      'invalid_file_type',
      415,
      'Only JPEG, PNG, and WebP images are accepted.',
    );
  }

  const bytes = new Uint8Array(await value.arrayBuffer());
  if (!hasMatchingSignature(value.type, bytes)) {
    throw new RequestPolicyError(
      'invalid_image_signature',
      415,
      'The file contents do not match the declared image type.',
    );
  }

  return { bytes, mimeType: value.type };
};

export const parseAnalysisText = (rawText: string): ImageAnalysisResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new RequestPolicyError(
      'invalid_provider_response',
      502,
      'The image provider returned invalid JSON.',
    );
  }

  if (!isRecord(parsed) || typeof parsed.is_relevant !== 'boolean') {
    throw new RequestPolicyError(
      'invalid_provider_response',
      502,
      'The image provider returned an invalid result.',
    );
  }

  if (!parsed.is_relevant) {
    if (typeof parsed.relevance_reason !== 'string' || parsed.relevance_reason.trim() === '') {
      throw new RequestPolicyError(
        'invalid_provider_response',
        502,
        'The image provider omitted the relevance reason.',
      );
    }

    return {
      is_relevant: false,
      relevance_reason: parsed.relevance_reason.trim(),
      problem_type: 'none',
      severity: 0,
      description: '',
      estimated_repair_cost_soles: 0,
      safety_hazard: false,
    };
  }

  if (
    typeof parsed.problem_type !== 'string'
    || !RELEVANT_PROBLEM_TYPES.has(parsed.problem_type as RelevantProblemType)
    || typeof parsed.severity !== 'number'
    || !Number.isInteger(parsed.severity)
    || parsed.severity < 1
    || parsed.severity > 5
    || typeof parsed.description !== 'string'
    || parsed.description.trim() === ''
    || parsed.description.length > 500
    || typeof parsed.estimated_repair_cost_soles !== 'number'
    || !Number.isFinite(parsed.estimated_repair_cost_soles)
    || parsed.estimated_repair_cost_soles < 0
    || parsed.estimated_repair_cost_soles > 1_000_000_000
    || typeof parsed.safety_hazard !== 'boolean'
  ) {
    throw new RequestPolicyError(
      'invalid_provider_response',
      502,
      'The image provider returned an invalid result.',
    );
  }

  return {
    is_relevant: true,
    problem_type: parsed.problem_type as RelevantProblemType,
    severity: parsed.severity,
    description: parsed.description.trim(),
    estimated_repair_cost_soles: parsed.estimated_repair_cost_soles,
    safety_hazard: parsed.safety_hazard,
  };
};
