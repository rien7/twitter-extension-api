import { describe, expect, it } from 'vitest';

import {
  DEFAULT_BLOCK_ENDPOINT,
  DEFAULT_BLOCK_FORM,
  buildBlockRequest
} from '../api/action/block/default';

describe('block defaults', () => {
  it('builds a request from defaults and required userId', () => {
    const request = buildBlockRequest({
      userId: '1744935284939079681'
    });

    expect(request.endpoint).toBe(DEFAULT_BLOCK_ENDPOINT);
    expect(request.form).toEqual({
      ...DEFAULT_BLOCK_FORM,
      user_id: '1744935284939079681'
    });
  });

  it('allows overrides while keeping userId as highest-priority field', () => {
    const request = buildBlockRequest({
      userId: '100',
      endpoint: '/custom-block-endpoint',
      formOverride: {
        user_id: '200'
      }
    });

    expect(request.endpoint).toBe('/custom-block-endpoint');
    expect(request.form.user_id).toBe('100');
  });

  it('rejects empty userId at runtime', () => {
    expect(() => {
      buildBlockRequest({
        userId: ''
      });
    }).toThrowError('block requires a non-empty userId');
  });
});
