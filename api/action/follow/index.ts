import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildFollowRequest } from './default';
import { FOLLOW_DESC_TEXT, followMeta, getFollowDefaultParams } from './desc';
import { fetchFollowResponse } from './fetch';
import { normalizeFollowResponse } from './normalize';
import type { FollowRequest, FollowResponse } from './types';

async function followImpl(input: FollowRequest): Promise<FollowResponse> {
  const resolved = buildFollowRequest(input);
  const payload = await fetchFollowResponse(resolved);
  return normalizeFollowResponse(payload, resolved.form.user_id);
}

/**
 * @summary Follow a target user using friendships/create endpoint.
 * @param input Follow request input with required `userId`.
 * @returns Normalized follow result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.follow({ userId: '42' });
 */
export const follow = createCallableApi<FollowRequest, FollowResponse>(followImpl, {
  desc: FOLLOW_DESC_TEXT,
  getDefaultParams: getFollowDefaultParams,
  meta: followMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
