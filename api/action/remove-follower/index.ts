import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildRemoveFollowerRequest } from './default';
import {
  getRemoveFollowerDefaultParams,
  REMOVE_FOLLOWER_DESC_TEXT,
  removeFollowerMeta
} from './desc';
import { fetchRemoveFollowerResponse } from './fetch';
import { normalizeRemoveFollowerResponse } from './normalize';
import type {
  RemoveFollowerRequest,
  RemoveFollowerResponse
} from './types';

async function removeFollowerImpl(input: RemoveFollowerRequest): Promise<RemoveFollowerResponse> {
  const resolved = buildRemoveFollowerRequest(input);
  const payload = await fetchRemoveFollowerResponse(resolved);
  return normalizeRemoveFollowerResponse(payload, resolved.variables.target_user_id);
}

/**
 * @summary Remove a follower via GraphQL RemoveFollower mutation.
 * @param input Remove-follower request with required `targetUserId`.
 * @returns Normalized mutation result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.removeFollower({ targetUserId: '42' });
 */
export const removeFollower = createCallableApi<RemoveFollowerRequest, RemoveFollowerResponse>(
  removeFollowerImpl,
  {
    desc: REMOVE_FOLLOWER_DESC_TEXT,
    getDefaultParams: getRemoveFollowerDefaultParams,
    meta: removeFollowerMeta
  }
);

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
