import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildUserTweetsAndRepliesRequest } from './default';
import {
  getUserTweetsAndRepliesDefaultParams,
  USER_TWEETS_AND_REPLIES_DESC_TEXT,
  userTweetsAndRepliesMeta
} from './desc';
import { fetchUserTweetsAndRepliesResponse } from './fetch';
import { normalizeUserTweetsAndRepliesResponse } from './normalize';
import type {
  UserTweetsAndRepliesRequest,
  UserTweetsAndRepliesResponse
} from './types';

async function userTweetsAndRepliesImpl(
  input: UserTweetsAndRepliesRequest = {}
): Promise<UserTweetsAndRepliesResponse> {
  const resolved = buildUserTweetsAndRepliesRequest(input);
  const payload = await fetchUserTweetsAndRepliesResponse(resolved);
  return normalizeUserTweetsAndRepliesResponse(payload);
}

/**
 * @summary Fetch user tweets-and-replies timeline.
 * @param input Optional query overrides. If `userId` is omitted, self user id from `twid` is used.
 * @returns Normalized timeline data with full payload in `__original`.
 * @example
 * const page = await window.x.api.query.userTweetsAndReplies({ count: 40 });
 */
export const userTweetsAndReplies = createCallableApi<
  UserTweetsAndRepliesRequest,
  UserTweetsAndRepliesResponse
>(userTweetsAndRepliesImpl, {
  desc: USER_TWEETS_AND_REPLIES_DESC_TEXT,
  getDefaultParams: getUserTweetsAndRepliesDefaultParams,
  meta: userTweetsAndRepliesMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
