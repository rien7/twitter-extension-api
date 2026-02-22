import { describe, expect, it } from 'vitest';

import {
  DEFAULT_REMOVE_FOLLOWER_OPERATION_NAME,
  DEFAULT_REMOVE_FOLLOWER_QUERY_ID,
  DEFAULT_REMOVE_FOLLOWER_VARIABLES,
  buildRemoveFollowerRequest
} from '../api/action/remove-follower/default';

describe('removeFollower defaults', () => {
  it('builds a request from defaults and required targetUserId', () => {
    const request = buildRemoveFollowerRequest({
      targetUserId: '1808093317894492160'
    });

    expect(request.operationName).toBe(DEFAULT_REMOVE_FOLLOWER_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_REMOVE_FOLLOWER_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_REMOVE_FOLLOWER_VARIABLES,
      target_user_id: '1808093317894492160'
    });
  });

  it('allows overrides while keeping targetUserId as highest-priority field', () => {
    const request = buildRemoveFollowerRequest({
      targetUserId: '100',
      queryId: 'custom-remove-follower-query-id',
      variablesOverride: {
        target_user_id: '200'
      }
    });

    expect(request.queryId).toBe('custom-remove-follower-query-id');
    expect(request.endpoint).toBe('/i/api/graphql/custom-remove-follower-query-id/RemoveFollower');
    expect(request.variables.target_user_id).toBe('100');
  });

  it('rejects empty targetUserId at runtime', () => {
    expect(() => {
      buildRemoveFollowerRequest({
        targetUserId: ''
      });
    }).toThrowError('remove-follower requires a non-empty targetUserId');
  });
});
