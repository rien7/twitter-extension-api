import { afterEach, describe, expect, it, vi } from 'vitest';

import { deleteRetweet } from '../api/action/delete-retweet';
import type { DeleteRetweetOriginalResponse } from '../api/action/delete-retweet/types';

describe('deleteRetweet response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields and keeps full raw payload in __original', async () => {
    const rawPayload: DeleteRetweetOriginalResponse = {
      data: {
        unretweet: {
          source_tweet_results: {
            result: {
              rest_id: '42'
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

    const response = await deleteRetweet({
      tweetId: '42'
    });

    expect(response.success).toBe(true);
    expect(response.sourceTweetId).toBe('42');
    expect(response.unretweetedTweetId).toBe('42');
    expect(response.__original).toEqual(rawPayload);
  });
});
