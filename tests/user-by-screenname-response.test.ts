import { afterEach, describe, expect, it, vi } from 'vitest';

import { userByScreenName } from '../api/query/user-by-screenname';
import type { UserByScreenNameOriginalResponse } from '../api/query/user-by-screenname/types';

describe('userByScreenName response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts profile fields and keeps full raw payload in __original', async () => {
    const rawPayload: UserByScreenNameOriginalResponse = {
      data: {
        user: {
          result: {
            __typename: 'User',
            id: 'VXNlcjox',
            rest_id: '1',
            core: {
              name: 'Alice',
              screen_name: 'alice'
            },
            profile_bio: {
              description: 'bio'
            },
            location: {
              location: 'United States'
            },
            avatar: {
              image_url: 'https://img/alice.jpg'
            },
            legacy: {
              followers_count: 10,
              friends_count: 20,
              verified: false,
              protected: false
            },
            verification: {
              verified: true
            },
            relationship_perspectives: {
              following: true,
              followed_by: false,
              blocking: false,
              blocked_by: false,
              muting: false
            },
            dm_permissions: {
              can_dm: true
            },
            media_permissions: {
              can_media_tag: true
            },
            is_blue_verified: false
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

    const response = await userByScreenName({
      screenName: '@alice'
    });

    expect(response.resultType).toBe('User');
    expect(response.user?.userId).toBe('1');
    expect(response.user?.screenName).toBe('alice');
    expect(response.user?.relationship?.following).toBe(true);
    expect(response.restId).toBe('1');
    expect(response.legacyId).toBe('VXNlcjox');
    expect(response.verified).toBe(true);
    expect(response.isBlueVerified).toBe(false);
    expect(response.canDm).toBe(true);
    expect(response.canMediaTag).toBe(true);
    expect(response.unavailableReason).toBeUndefined();
    expect(response.__original).toEqual(rawPayload);
  });

  it('keeps unavailable reason when user result is unavailable', async () => {
    const rawPayload: UserByScreenNameOriginalResponse = {
      data: {
        user: {
          result: {
            __typename: 'UserUnavailable',
            reason: 'Suspended'
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

    const response = await userByScreenName({
      screenName: 'suspended_user'
    });

    expect(response.resultType).toBe('UserUnavailable');
    expect(response.user).toBeUndefined();
    expect(response.unavailableReason).toBe('Suspended');
    expect(response.__original).toEqual(rawPayload);
  });
});
