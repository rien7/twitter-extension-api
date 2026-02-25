import { afterEach, describe, expect, it, vi } from 'vitest';

import { unfavoriteTweet } from '../api/action/unfavorite-tweet';
import type { UnfavoriteTweetOriginalResponse } from '../api/action/unfavorite-tweet/types';

describe('unfavoriteTweet response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields and keeps full raw payload in __original', async () => {
    const rawPayload: UnfavoriteTweetOriginalResponse = {
      data: {
        unfavorite_tweet: 'Done'
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

    const response = await unfavoriteTweet({
      tweetId: '42'
    });

    expect(response.success).toBe(true);
    expect(response.targetTweetId).toBe('42');
    expect(response.message).toBe('Done');
    expect(response.__original).toEqual(rawPayload);
  });
});
