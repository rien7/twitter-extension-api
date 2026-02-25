import { afterEach, describe, expect, it, vi } from 'vitest';

import { follow } from '../api/action/follow';
import type { FollowOriginalResponse } from '../api/action/follow/types';

describe('follow response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields and keeps full raw payload in __original', async () => {
    const rawPayload: FollowOriginalResponse = {
      id_str: '1526042174298550273',
      name: 'name',
      screen_name: 'screen',
      description: 'bio',
      following: true,
      followed_by: false,
      blocking: false,
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

    const response = await follow({
      userId: '1526042174298550273'
    });

    expect(response.success).toBe(true);
    expect(response.targetUserId).toBe('1526042174298550273');
    expect(response.targetUser?.userId).toBe('1526042174298550273');
    expect(response.relationship.following).toBe(true);
    expect(response.__original).toEqual(rawPayload);
  });
});
