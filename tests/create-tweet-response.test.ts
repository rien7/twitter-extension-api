import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTweet } from '../api/action/create-tweet';
import type { CreateTweetOriginalResponse } from '../api/action/create-tweet/types';

describe('createTweet response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('normalizes quote tweet response fields', async () => {
    const rawPayload: CreateTweetOriginalResponse = {
      data: {
        create_tweet: {
          tweet_results: {
            result: {
              rest_id: '42',
              legacy: {
                id_str: '42',
                full_text: 'quote text',
                user_id_str: '2025181433820819456',
                conversation_id_str: '42',
                is_quote_status: true,
                quoted_status_id_str: '42',
                in_reply_to_status_id_str: null,
                in_reply_to_user_id_str: null,
                in_reply_to_screen_name: null
              }
            }
          }
        }
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

    const response = await createTweet({
      mode: 'quote',
      tweetText: 'quote text',
      quoteTweetId: '42'
    });

    expect(response.success).toBe(true);
    expect(response.requestedMode).toBe('quote');
    expect(response.mode).toBe('quote');
    expect(response.tweetId).toBe('42');
    expect(response.quotedTweetId).toBe('42');
    expect(response.inReplyToTweetId).toBeUndefined();
    expect(response.__original).toEqual(rawPayload);
  });

  it('normalizes reply tweet response fields', async () => {
    const rawPayload: CreateTweetOriginalResponse = {
      data: {
        create_tweet: {
          tweet_results: {
            result: {
              rest_id: '42',
              legacy: {
                id_str: '42',
                full_text: '@someone reply text',
                user_id_str: '2025181433820819456',
                conversation_id_str: '42',
                is_quote_status: false,
                quoted_status_id_str: null,
                in_reply_to_status_id_str: '42',
                in_reply_to_user_id_str: '1609619970811482112',
                in_reply_to_screen_name: 'someone'
              }
            }
          }
        }
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

    const response = await createTweet({
      mode: 'reply',
      tweetText: 'reply text',
      inReplyToTweetId: '42'
    });

    expect(response.success).toBe(true);
    expect(response.requestedMode).toBe('reply');
    expect(response.mode).toBe('reply');
    expect(response.inReplyToTweetId).toBe('42');
    expect(response.quotedTweetId).toBeUndefined();
    expect(response.__original).toEqual(rawPayload);
  });
});
