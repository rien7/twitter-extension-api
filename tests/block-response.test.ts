import { afterEach, describe, expect, it, vi } from 'vitest';

import { block } from '../api/action/block';
import type { BlockOriginalResponse } from '../api/action/block/types';

describe('block response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields and keeps full raw payload in __original', async () => {
    const rawPayload: BlockOriginalResponse = {
      id_str: '1744935284939079681',
      name: 'name',
      screen_name: 'screen',
      description: 'bio',
      following: false,
      followed_by: false,
      blocking: true,
      blocked_by: false,
      muting: false
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

    const response = await block({
      userId: '1744935284939079681'
    });

    expect(response.success).toBe(true);
    expect(response.userId).toBe('1744935284939079681');
    expect(response.targetUser?.id).toBe('1744935284939079681');
    expect(response.relationship.blocking).toBe(true);
    expect(response.__original).toEqual(rawPayload);
  });
});
