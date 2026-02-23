import { afterEach, describe, expect, it, vi } from 'vitest';

import { deleteBookmark } from '../api/action/delete-bookmark';
import type { DeleteBookmarkOriginalResponse } from '../api/action/delete-bookmark/types';

describe('deleteBookmark response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields and keeps full raw payload in __original', async () => {
    const rawPayload: DeleteBookmarkOriginalResponse = {
      data: {
        tweet_bookmark_delete: 'Done'
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

    const response = await deleteBookmark({
      tweetId: '42'
    });

    expect(response.success).toBe(true);
    expect(response.tweetId).toBe('42');
    expect(response.message).toBe('Done');
    expect(response.__original).toEqual(rawPayload);
  });
});
