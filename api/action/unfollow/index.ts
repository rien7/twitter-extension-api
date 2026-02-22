import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildUnfollowRequest } from './default';
import { UNFOLLOW_DESC_TEXT, unfollowMeta, getUnfollowDefaultParams } from './desc';
import { fetchUnfollowResponse } from './fetch';
import { normalizeUnfollowResponse } from './normalize';
import type { UnfollowRequest, UnfollowResponse } from './types';

async function unfollowImpl(input: UnfollowRequest): Promise<UnfollowResponse> {
  const resolved = buildUnfollowRequest(input);
  const payload = await fetchUnfollowResponse(resolved);
  return normalizeUnfollowResponse(payload, resolved.form.user_id);
}

/**
 * @summary Unfollow a target user using friendships/destroy endpoint.
 * @param input Unfollow request input with required `userId`.
 * @returns Normalized unfollow result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.unfollow({ userId: '42' });
 */
export const unfollow = createCallableApi<UnfollowRequest, UnfollowResponse>(unfollowImpl, {
  desc: UNFOLLOW_DESC_TEXT,
  getDefaultParams: getUnfollowDefaultParams,
  meta: unfollowMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
