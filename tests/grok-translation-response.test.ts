import { afterEach, describe, expect, it, vi } from 'vitest';

import { grokTranslation } from '../api/action/grok-translation';
import type { GrokTranslationOriginalResponse } from '../api/action/grok-translation/types';

describe('grokTranslation response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts translated text fields and keeps full raw payload in __original', async () => {
    const rawPayload: GrokTranslationOriginalResponse = {
      result: {
        content_type: 'POST',
        text: "I'll put on the hardware and go~",
        entities: {}
      }
    };

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(JSON.stringify(rawPayload), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      })
    );

    const response = await grokTranslation({
      tweetId: '42',
      dstLang: 'en'
    });

    expect(response.success).toBe(true);
    expect(response.targetTweetId).toBe('42');
    expect(response.dstLang).toBe('en');
    expect(response.contentType).toBe('POST');
    expect(response.translatedText).toBe("I'll put on the hardware and go~");
    expect(response.entities).toEqual({});
    expect(response.__original).toEqual(rawPayload);
  });

  it('parses base64 data-url wrapper payload returned by this endpoint', async () => {
    const rawPayload: GrokTranslationOriginalResponse = {
      result: {
        content_type: 'POST',
        text: "I'll put on the hardware and go~",
        entities: {}
      }
    };
    const encodedPayload = Buffer.from(JSON.stringify(rawPayload), 'utf8').toString('base64');
    const dataUrlPayload = `data:application/octet-stream;base64,${encodedPayload}`;

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(dataUrlPayload, {
          status: 200,
          headers: { 'content-type': 'text/plain;charset=UTF-8' }
        });
      })
    );

    const response = await grokTranslation({
      tweetId: '42',
      dstLang: 'en'
    });

    expect(response.success).toBe(true);
    expect(response.translatedText).toBe("I'll put on the hardware and go~");
    expect(response.__original).toEqual(rawPayload);
  });

  it('parses streamed json fragments and merges text chunks', async () => {
    const streamedPayload = [
      '{"result":{"content_type":"POST","text":"a"}}',
      '{"result":{"content_type":"POST","text":"a"}}',
      '{"result":{"content_type":"POST","text":"b"}}',
      '{"result":{"content_type":"POST","text":"c"}'
    ].join('\n');

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(streamedPayload, {
          status: 200,
          headers: { 'content-type': 'text/plain;charset=UTF-8' }
        });
      })
    );

    const response = await grokTranslation({
      tweetId: '42',
      dstLang: 'en'
    });

    expect(response.success).toBe(true);
    expect(response.translatedText).toBe('abc');
    expect(response.contentType).toBe('POST');
    expect(response.__original.result?.text).toBe('abc');
  });
});
