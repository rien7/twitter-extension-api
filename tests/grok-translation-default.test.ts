import { describe, expect, it } from 'vitest';

import {
  DEFAULT_GROK_TRANSLATION_BODY,
  DEFAULT_GROK_TRANSLATION_ENDPOINT,
  buildGrokTranslationRequest
} from '../api/action/grok-translation/default';

describe('grokTranslation defaults', () => {
  it('builds a request from defaults and required tweetId', () => {
    const request = buildGrokTranslationRequest({
      tweetId: '42'
    });

    expect(request.endpoint).toBe(DEFAULT_GROK_TRANSLATION_ENDPOINT);
    expect(request.body).toEqual({
      ...DEFAULT_GROK_TRANSLATION_BODY,
      id: '42'
    });
  });

  it('allows overrides while keeping tweetId as highest-priority field', () => {
    const request = buildGrokTranslationRequest({
      tweetId: '42',
      dstLang: 'ja',
      contentType: 'POST',
      endpoint: 'https://api.x.com/2/grok/translation.json?exp=1',
      bodyOverride: {
        id: '200',
        dst_lang: 'zh'
      }
    });

    expect(request.endpoint).toBe('https://api.x.com/2/grok/translation.json?exp=1');
    expect(request.body.id).toBe('42');
    expect(request.body.dst_lang).toBe('ja');
    expect(request.body.content_type).toBe('POST');
  });

  it('rejects empty tweetId at runtime', () => {
    expect(() => {
      buildGrokTranslationRequest({
        tweetId: ''
      });
    }).toThrowError('grok-translation requires a non-empty tweetId');
  });

  it('rejects empty dstLang at runtime', () => {
    expect(() => {
      buildGrokTranslationRequest({
        tweetId: '42',
        dstLang: '   '
      });
    }).toThrowError('grok-translation dstLang must be a non-empty string');
  });
});
