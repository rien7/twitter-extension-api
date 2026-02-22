import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildFollowListRequest } from './default';
import { FOLLOW_LIST_DESC_TEXT, followListMeta, getFollowListDefaultParams } from './desc';
import { fetchFollowListResponse } from './fetch';
import { normalizeFollowListResponse } from './normalize';
import type { FollowListRequest, FollowListResponse } from './types';

async function followListImpl(input: FollowListRequest = {}): Promise<FollowListResponse> {
  const resolved = buildFollowListRequest(input);
  const payload = await fetchFollowListResponse(resolved);
  return normalizeFollowListResponse(payload);
}

/**
 * @summary Fetch following timeline entries for a user.
 * @param input Optional query overrides. If `userId` is omitted, self user id from `twid` is used.
 * @returns Normalized following data with full payload in `__original`.
 * @example
 * const page = await window.x.api.query.followList({ count: 20 });
 */
export const followList = createCallableApi<FollowListRequest, FollowListResponse>(followListImpl, {
  desc: FOLLOW_LIST_DESC_TEXT,
  getDefaultParams: getFollowListDefaultParams,
  meta: followListMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
