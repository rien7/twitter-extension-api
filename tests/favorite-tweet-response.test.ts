import { afterEach, describe, expect, it, vi } from 'vitest';

import { favoriteTweet } from '../api/action/favorite-tweet';
import type { FavoriteTweetOriginalResponse } from '../api/action/favorite-tweet/types';

describe('favoriteTweet response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields and keeps full raw payload in __original', async () => {
    const rawPayload: FavoriteTweetOriginalResponse = {
      data: {
        favorite_tweet: 'Done'
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

    const response = await favoriteTweet({
      tweetId: '42'
    });

    expect(response.success).toBe(true);
    expect(response.targetTweetId).toBe('42');
    expect(response.message).toBe('Done');
    expect(response.__original).toEqual(rawPayload);
  });
});
