import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildUserTweetsRequest } from './default';
import {
  getUserTweetsDefaultParams,
  USER_TWEETS_DESC_TEXT,
  userTweetsMeta
} from './desc';
import { fetchUserTweetsResponse } from './fetch';
import { normalizeUserTweetsResponse } from './normalize';
import type { UserTweetsRequest, UserTweetsResponse } from './types';

async function userTweetsImpl(input: UserTweetsRequest = {}): Promise<UserTweetsResponse> {
  const resolved = buildUserTweetsRequest(input);
  const payload = await fetchUserTweetsResponse(resolved);
  return normalizeUserTweetsResponse(payload);
}

/**
 * @summary Fetch user tweets timeline.
 * @param input Optional query overrides. If `userId` is omitted, self user id from `twid` is used.
 * @returns Normalized timeline data with full payload in `__original`.
 * @example
 * const page = await window.x.api.query.userTweets({ count: 40 });
 */
export const userTweets = createCallableApi<UserTweetsRequest, UserTweetsResponse>(userTweetsImpl, {
  desc: USER_TWEETS_DESC_TEXT,
  getDefaultParams: getUserTweetsDefaultParams,
  meta: userTweetsMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
