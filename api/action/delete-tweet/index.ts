import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildDeleteTweetRequest } from './default';
import { DELETE_TWEET_DESC_TEXT, deleteTweetMeta, getDeleteTweetDefaultParams } from './desc';
import { fetchDeleteTweetResponse } from './fetch';
import { normalizeDeleteTweetResponse } from './normalize';
import type {
  DeleteTweetRequest,
  DeleteTweetResponse
} from './types';

async function deleteTweetImpl(input: DeleteTweetRequest): Promise<DeleteTweetResponse> {
  const resolved = buildDeleteTweetRequest(input);
  const payload = await fetchDeleteTweetResponse(resolved);
  return normalizeDeleteTweetResponse(payload, resolved.variables.tweet_id);
}

/**
 * @summary Delete a tweet via GraphQL DeleteTweet mutation.
 * @param input Delete request with required `tweetId`.
 * @returns Normalized delete result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.deleteTweet({ tweetId: '42' });
 */
export const deleteTweet = createCallableApi<DeleteTweetRequest, DeleteTweetResponse>(deleteTweetImpl, {
  desc: DELETE_TWEET_DESC_TEXT,
  getDefaultParams: getDeleteTweetDefaultParams,
  meta: deleteTweetMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
