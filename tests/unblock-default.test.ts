import { describe, expect, it } from 'vitest';

import {
  DEFAULT_UNBLOCK_ENDPOINT,
  DEFAULT_UNBLOCK_FORM,
  buildUnblockRequest
} from '../api/action/unblock/default';

describe('unblock defaults', () => {
  it('builds a request from defaults and required userId', () => {
    const request = buildUnblockRequest({
      userId: '1744935284939079681'
    });

    expect(request.endpoint).toBe(DEFAULT_UNBLOCK_ENDPOINT);
    expect(request.form).toEqual({
      ...DEFAULT_UNBLOCK_FORM,
      user_id: '1744935284939079681'
    });
  });

  it('allows overrides while keeping userId as highest-priority field', () => {
    const request = buildUnblockRequest({
      userId: '100',
      endpoint: '/custom-unblock-endpoint',
      formOverride: {
        user_id: '200'
      }
    });

    expect(request.endpoint).toBe('/custom-unblock-endpoint');
    expect(request.form.user_id).toBe('100');
  });

  it('rejects empty userId at runtime', () => {
    expect(() => {
      buildUnblockRequest({
        userId: ''
      });
    }).toThrowError('unblock requires a non-empty userId');
  });
});
