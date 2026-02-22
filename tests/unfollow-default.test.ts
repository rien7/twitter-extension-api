import { describe, expect, it } from 'vitest';

import {
  DEFAULT_UNFOLLOW_ENDPOINT,
  DEFAULT_UNFOLLOW_FORM,
  buildUnfollowRequest
} from '../api/action/unfollow/default';

describe('unfollow defaults', () => {
  it('builds a request from defaults and required userId', () => {
    const request = buildUnfollowRequest({
      userId: '1526042174298550273'
    });

    expect(request.endpoint).toBe(DEFAULT_UNFOLLOW_ENDPOINT);
    expect(request.form).toEqual({
      ...DEFAULT_UNFOLLOW_FORM,
      user_id: '1526042174298550273'
    });
  });

  it('allows overrides while keeping userId as highest-priority field', () => {
    const request = buildUnfollowRequest({
      userId: '100',
      endpoint: '/custom-unfollow-endpoint',
      formOverride: {
        user_id: '200',
        include_want_retweets: '0'
      }
    });

    expect(request.endpoint).toBe('/custom-unfollow-endpoint');
    expect(request.form.user_id).toBe('100');
    expect(request.form.include_want_retweets).toBe('0');
  });

  it('rejects empty userId at runtime', () => {
    expect(() => {
      buildUnfollowRequest({
        userId: ''
      });
    }).toThrowError('unfollow requires a non-empty userId');
  });
});
