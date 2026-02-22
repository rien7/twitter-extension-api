import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildTweetDetailRequest } from './default';
import { getTweetDetailDefaultParams, TWEET_DETAIL_DESC_TEXT, tweetDetailMeta } from './desc';
import { fetchTweetDetailResponse } from './fetch';
import { normalizeTweetDetailResponse } from './normalize';
import type { TweetDetailRequest, TweetDetailResponse } from './types';

async function tweetDetailImpl(input: TweetDetailRequest): Promise<TweetDetailResponse> {
  const resolved = buildTweetDetailRequest(input);
  const payload = await fetchTweetDetailResponse(resolved);
  return normalizeTweetDetailResponse(payload, resolved.variables.focalTweetId);
}

/**
 * @summary Fetch tweet detail thread by tweet id.
 * @param input Request input containing required `detailId`.
 * @returns Normalized thread data with full payload in `__original`.
 * @example
 * const detail = await window.x.api.query.tweetDetail({ detailId: '42' });
 */
export const tweetDetail = createCallableApi<TweetDetailRequest, TweetDetailResponse>(tweetDetailImpl, {
  desc: TWEET_DETAIL_DESC_TEXT,
  getDefaultParams: getTweetDetailDefaultParams,
  meta: tweetDetailMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
