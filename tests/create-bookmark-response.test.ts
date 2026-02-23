import { afterEach, describe, expect, it, vi } from 'vitest';

import { createBookmark } from '../api/action/create-bookmark';
import type { CreateBookmarkOriginalResponse } from '../api/action/create-bookmark/types';

describe('createBookmark response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields and keeps full raw payload in __original', async () => {
    const rawPayload: CreateBookmarkOriginalResponse = {
      data: {
        tweet_bookmark_put: 'Done'
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

    const response = await createBookmark({
      tweetId: '42'
    });

    expect(response.success).toBe(true);
    expect(response.tweetId).toBe('42');
    expect(response.message).toBe('Done');
    expect(response.__original).toEqual(rawPayload);
  });
});
