import {
  assertEquals,
  assertRejects,
  assertThrows,
} from '@std/assert';
import {
  MAX_REQUEST_BYTES,
  parseAnalysisText,
  readBoundedRequestBody,
  RequestPolicyError,
  validateContentLength,
  validateImage,
  validateLanguage,
} from './policy.ts';

Deno.test('request policy rejects oversized requests before parsing multipart data', () => {
  const error = assertThrows(
    () => validateContentLength((MAX_REQUEST_BYTES + 1).toString()),
    RequestPolicyError,
  );

  assertEquals(error.code, 'request_too_large');
  assertEquals(error.status, 413);
});

Deno.test('request policy enforces the body limit when Content-Length is absent', async () => {
  const request = new Request('http://example.test', {
    method: 'POST',
    body: new Uint8Array(MAX_REQUEST_BYTES + 1),
  });
  const error = await assertRejects(
    () => readBoundedRequestBody(request),
    RequestPolicyError,
  );

  assertEquals(error.code, 'request_too_large');
  assertEquals(error.status, 413);
});

Deno.test('request policy accepts only supported languages', () => {
  assertEquals(validateLanguage(null), 'es');
  assertEquals(validateLanguage('en'), 'en');
  assertThrows(() => validateLanguage('fr'), RequestPolicyError);
});

Deno.test('image policy checks MIME type and matching file signature', async () => {
  const jpeg = new File(
    [new Uint8Array([0xff, 0xd8, 0xff, 0xdb])],
    'street.jpg',
    { type: 'image/jpeg' },
  );

  const result = await validateImage(jpeg);
  assertEquals(result.mimeType, 'image/jpeg');
  assertEquals(result.bytes.length, 4);

  const disguisedImage = new File(
    [new Uint8Array([0x47, 0x49, 0x46])],
    'street.jpg',
    { type: 'image/jpeg' },
  );
  const error = await assertRejects(
    () => validateImage(disguisedImage),
    RequestPolicyError,
  );
  assertEquals(error.code, 'invalid_image_signature');
  assertEquals(error.status, 415);
});

Deno.test('provider output is validated and non-relevant results are normalized', () => {
  const result = parseAnalysisText(JSON.stringify({
    is_relevant: false,
    relevance_reason: 'Private-home interior.',
    problem_type: 'road_damage',
    severity: 5,
    description: 'Ignore this.',
    estimated_repair_cost_soles: 999,
    safety_hazard: true,
  }));

  assertEquals(result, {
    is_relevant: false,
    relevance_reason: 'Private-home interior.',
    problem_type: 'none',
    severity: 0,
    description: '',
    estimated_repair_cost_soles: 0,
    safety_hazard: false,
  });
});

Deno.test('provider output rejects incomplete relevant results', () => {
  const error = assertThrows(
    () => parseAnalysisText(JSON.stringify({
      is_relevant: true,
      problem_type: 'road_damage',
      severity: 3,
    })),
    RequestPolicyError,
  );

  assertEquals(error.code, 'invalid_provider_response');
  assertEquals(error.status, 502);
});
