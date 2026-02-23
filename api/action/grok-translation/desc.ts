import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_GROK_TRANSLATION_BODY,
  DEFAULT_GROK_TRANSLATION_ENDPOINT
} from './default';

export const GROK_TRANSLATION_DESC_TEXT = [
  '[grok-translation]',
  'Purpose: Translate a post text into target language via Grok translation endpoint.',
  'Call: window.x.api.action.grokTranslation(input)',
  'Input:',
  '  Required:',
  '    - tweetId',
  '  Optional:',
  '    - dstLang',
  '    - contentType',
  '    - endpoint',
  '    - headers',
  '    - bodyOverride',
  'Returns: success, tweetId, dstLang, contentType, translatedText, entities, errors'
].join('\n');

const GROK_TRANSLATION_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_GROK_TRANSLATION_ENDPOINT,
  body: { ...DEFAULT_GROK_TRANSLATION_BODY }
});

export function getGrokTranslationDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(GROK_TRANSLATION_DEFAULT_PARAMS_TEMPLATE);
}

export const grokTranslationMeta: XApiMeta = {
  id: 'grok-translation',
  title: 'Grok Translation',
  match: {
    method: 'POST',
    path: '/2/grok/translation.json'
  },
  requestTypeName: 'GrokTranslationRequest',
  responseTypeName: 'GrokTranslationResponse'
};
