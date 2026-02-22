import { afterEach, describe, expect, it, vi } from 'vitest';

import { removeFollower } from '../api/action/remove-follower';
import type { RemoveFollowerOriginalResponse } from '../api/action/remove-follower/types';

describe('removeFollower response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields and keeps full raw payload in __original', async () => {
    const rawPayload: RemoveFollowerOriginalResponse = {
      data: {
        remove_follower: {
          __typename: 'UnfollowSuccessResult',
          unfollow_success_reason: 'Unfollowed'
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

    const response = await removeFollower({
      targetUserId: '1808093317894492160'
    });

    expect(response.success).toBe(true);
    expect(response.targetUserId).toBe('1808093317894492160');
    expect(response.resultType).toBe('UnfollowSuccessResult');
    expect(response.reason).toBe('Unfollowed');
    expect(response.__original).toEqual(rawPayload);
  });
});
