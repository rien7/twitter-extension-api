import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRetweet } from '../api/action/create-retweet';
import type { CreateRetweetOriginalResponse } from '../api/action/create-retweet/types';

describe('createRetweet response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields and keeps full raw payload in __original', async () => {
    const rawPayload: CreateRetweetOriginalResponse = {
      data: {
        create_retweet: {
          retweet_results: {
            result: {
              rest_id: '2025809610016506341'
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

    const response = await createRetweet({
      tweetId: '42'
    });

    expect(response.success).toBe(true);
    expect(response.sourceTweetId).toBe('42');
    expect(response.retweetId).toBe('2025809610016506341');
    expect(response.__original).toEqual(rawPayload);
  });
});
