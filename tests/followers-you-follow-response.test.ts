import { afterEach, describe, expect, it, vi } from 'vitest';

import { followersYouFollow } from '../api/query/followers-you-follow';
import type { FollowersYouFollowOriginalResponse } from '../api/query/followers-you-follow/types';

describe('followersYouFollow response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts hover-card fields and keeps full raw payload in __original', async () => {
    const rawPayload: FollowersYouFollowOriginalResponse = {
      users: [
        {
          id_str: 'u1',
          name: 'Alice',
          screen_name: 'alice',
          description: 'desc-a',
          profile_image_url_https: 'https://img/a.jpg',
          followers_count: 10,
          friends_count: 20,
          following: true,
          followed_by: false
        },
        {
          id: 2,
          name: 'Bob',
          screen_name: 'bob',
          profile_image_url: 'http://img/b.jpg',
          following: true,
          followed_by: true
        }
      ],
      next_cursor: 123,
      next_cursor_str: '123',
      previous_cursor: 0,
      previous_cursor_str: '0',
      total_count: 60
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

    const response = await followersYouFollow({
      userId: '42',
      count: 2
    });

    expect(response.users).toHaveLength(2);
    expect(response.users[0].userId).toBe('u1');
    expect(response.users[0].screenName).toBe('alice');
    expect(response.users[1].userId).toBe('2');
    expect(response.totalCount).toBe(60);
    expect(response.nextCursor).toBe('123');
    expect(response.prevCursor).toBeUndefined();
    expect(response.hasMore).toBe(true);
    expect(response.__original).toEqual(rawPayload);
  });
});
