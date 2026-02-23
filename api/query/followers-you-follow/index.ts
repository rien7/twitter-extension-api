import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildFollowersYouFollowRequest } from './default';
import {
  FOLLOWERS_YOU_FOLLOW_DESC_TEXT,
  followersYouFollowMeta,
  getFollowersYouFollowDefaultParams
} from './desc';
import { fetchFollowersYouFollowResponse } from './fetch';
import { normalizeFollowersYouFollowResponse } from './normalize';
import type { FollowersYouFollowRequest, FollowersYouFollowResponse } from './types';

async function followersYouFollowImpl(
  input: FollowersYouFollowRequest = {}
): Promise<FollowersYouFollowResponse> {
  const resolved = buildFollowersYouFollowRequest(input);
  const payload = await fetchFollowersYouFollowResponse(resolved);
  return normalizeFollowersYouFollowResponse(payload);
}

/**
 * @summary Fetch short follower preview: accounts you already follow who also follow target user.
 * @param input Optional request overrides. If `userId` is omitted, self user id from `twid` is used.
 * @returns Normalized follower-overlap data with full payload in `__original`.
 * @example
 * const preview = await window.x.api.query.followersYouFollow({ userId: '42', count: 3 });
 */
export const followersYouFollow = createCallableApi<FollowersYouFollowRequest, FollowersYouFollowResponse>(
  followersYouFollowImpl,
  {
    desc: FOLLOWERS_YOU_FOLLOW_DESC_TEXT,
    getDefaultParams: getFollowersYouFollowDefaultParams,
    meta: followersYouFollowMeta
  }
);

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
