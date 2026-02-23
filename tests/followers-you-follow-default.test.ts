import { afterEach, describe, expect, it, vi } from 'vitest';
import { __resetSelfUserIdForTests } from '../src/sdk/self-user-id';

import {
  DEFAULT_FOLLOWERS_YOU_FOLLOW_ENDPOINT,
  DEFAULT_FOLLOWERS_YOU_FOLLOW_PARAMS,
  buildFollowersYouFollowRequest
} from '../api/query/followers-you-follow/default';

describe('followersYouFollow defaults', () => {
  afterEach(() => {
    __resetSelfUserIdForTests();
    vi.unstubAllGlobals();
  });

  it('builds a request from defaults and explicit userId', () => {
    const request = buildFollowersYouFollowRequest({
      userId: '42'
    });

    expect(request.endpoint).toBe(DEFAULT_FOLLOWERS_YOU_FOLLOW_ENDPOINT);
    expect(request.params).toEqual({
      ...DEFAULT_FOLLOWERS_YOU_FOLLOW_PARAMS,
      user_id: '42'
    });
  });

  it('allows overrides while keeping userId as highest-priority field', () => {
    const request = buildFollowersYouFollowRequest({
      userId: '100',
      count: 10,
      cursor: 'cursor-next',
      withTotalCount: false,
      paramsOverride: {
        user_id: '200',
        include_blocking: '0'
      }
    });

    expect(request.params.user_id).toBe('100');
    expect(request.params.count).toBe('10');
    expect(request.params.cursor).toBe('cursor-next');
    expect(request.params.with_total_count).toBe('false');
    expect(request.params.include_blocking).toBe('0');
  });

  it('uses self userId from twid cookie when input userId is omitted', () => {
    vi.stubGlobal('document', {
      cookie: 'twid=u%3D42'
    });

    const request = buildFollowersYouFollowRequest();
    expect(request.params.user_id).toBe('42');
  });

  it('rejects invalid count values', () => {
    expect(() =>
      buildFollowersYouFollowRequest({
        userId: '42',
        count: 0
      })
    ).toThrowError('followers-you-follow count must be a positive integer');
  });
});
