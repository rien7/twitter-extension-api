import { describe, expect, it } from 'vitest';

import {
  DEFAULT_FOLLOW_ENDPOINT,
  DEFAULT_FOLLOW_FORM,
  buildFollowRequest
} from '../api/action/follow/default';

describe('follow defaults', () => {
  it('builds a request from defaults and required userId', () => {
    const request = buildFollowRequest({
      userId: '1526042174298550273'
    });

    expect(request.endpoint).toBe(DEFAULT_FOLLOW_ENDPOINT);
    expect(request.form).toEqual({
      ...DEFAULT_FOLLOW_FORM,
      user_id: '1526042174298550273'
    });
  });

  it('allows overrides while keeping userId as highest-priority field', () => {
    const request = buildFollowRequest({
      userId: '100',
      endpoint: '/custom-follow-endpoint',
      formOverride: {
        user_id: '200',
        include_want_retweets: '0'
      }
    });

    expect(request.endpoint).toBe('/custom-follow-endpoint');
    expect(request.form.user_id).toBe('100');
    expect(request.form.include_want_retweets).toBe('0');
  });

  it('rejects empty userId at runtime', () => {
    expect(() => {
      buildFollowRequest({
        userId: ''
      });
    }).toThrowError('follow requires a non-empty userId');
  });
});
