import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildGrokTranslationRequest } from './default';
import {
  getGrokTranslationDefaultParams,
  GROK_TRANSLATION_DESC_TEXT,
  grokTranslationMeta
} from './desc';
import { fetchGrokTranslationResponse } from './fetch';
import { normalizeGrokTranslationResponse } from './normalize';
import type { GrokTranslationRequest, GrokTranslationResponse } from './types';

async function grokTranslationImpl(input: GrokTranslationRequest): Promise<GrokTranslationResponse> {
  const resolved = buildGrokTranslationRequest(input);
  const payload = await fetchGrokTranslationResponse(resolved);
  return normalizeGrokTranslationResponse(payload, resolved);
}

/**
 * @summary Translate a post text to destination language using Grok translation endpoint.
 * @param input Translation request with required `tweetId`.
 * @returns Normalized translation result and full payload in `__original`.
 * @example
 * const translated = await window.x.api.action.grokTranslation({ tweetId: '42', dstLang: 'en' });
 */
export const grokTranslation = createCallableApi<GrokTranslationRequest, GrokTranslationResponse>(
  grokTranslationImpl,
  {
    desc: GROK_TRANSLATION_DESC_TEXT,
    getDefaultParams: getGrokTranslationDefaultParams,
    meta: grokTranslationMeta
  }
);

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
