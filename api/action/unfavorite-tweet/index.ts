import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildUnfavoriteTweetRequest } from './default';
import {
  getUnfavoriteTweetDefaultParams,
  UNFAVORITE_TWEET_DESC_TEXT,
  unfavoriteTweetMeta
} from './desc';
import { fetchUnfavoriteTweetResponse } from './fetch';
import { normalizeUnfavoriteTweetResponse } from './normalize';
import type {
  UnfavoriteTweetRequest,
  UnfavoriteTweetResponse
} from './types';

async function unfavoriteTweetImpl(input: UnfavoriteTweetRequest): Promise<UnfavoriteTweetResponse> {
  const resolved = buildUnfavoriteTweetRequest(input);
  const payload = await fetchUnfavoriteTweetResponse(resolved);
  return normalizeUnfavoriteTweetResponse(payload, resolved.variables.tweet_id);
}

/**
 * @summary Unlike a tweet via GraphQL UnfavoriteTweet mutation.
 * @param input Unfavorite request with required `tweetId`.
 * @returns Normalized unlike result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.unfavoriteTweet({ tweetId: '42' });
 */
export const unfavoriteTweet = createCallableApi<UnfavoriteTweetRequest, UnfavoriteTweetResponse>(
  unfavoriteTweetImpl,
  {
    desc: UNFAVORITE_TWEET_DESC_TEXT,
    getDefaultParams: getUnfavoriteTweetDefaultParams,
    meta: unfavoriteTweetMeta
  }
);

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
