import type {
  GrokTranslationRequest,
  GrokTranslationRequestBody,
  GrokTranslationResolvedRequest
} from './types';

export const DEFAULT_GROK_TRANSLATION_ENDPOINT = 'https://api.x.com/2/grok/translation.json';

export const DEFAULT_GROK_TRANSLATION_BODY: GrokTranslationRequestBody = {
  content_type: 'POST',
  id: '',
  dst_lang: 'en'
};

export function buildGrokTranslationRequest(input: GrokTranslationRequest): GrokTranslationResolvedRequest {
  const tweetId = normalizeRequiredValue(
    input.tweetId,
    'grok-translation requires a non-empty tweetId'
  );

  const body = mergeDefined(DEFAULT_GROK_TRANSLATION_BODY, input.bodyOverride);
  body.id = tweetId;

  if (input.contentType !== undefined) {
    body.content_type = normalizeRequiredValue(
      input.contentType,
      'grok-translation contentType must be a non-empty string'
    );
  }

  if (input.dstLang !== undefined) {
    body.dst_lang = normalizeRequiredValue(
      input.dstLang,
      'grok-translation dstLang must be a non-empty string'
    );
  }

  return {
    endpoint: input.endpoint ?? DEFAULT_GROK_TRANSLATION_ENDPOINT,
    headers: input.headers,
    body
  };
}

function mergeDefined<T extends object>(base: T, overrides?: Partial<T>): T {
  const merged = { ...base };

  if (!overrides) {
    return merged;
  }

  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const value = overrides[key];
    if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}

function normalizeRequiredValue(value: string, errorMessage: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(errorMessage);
  }
  return normalized;
}
