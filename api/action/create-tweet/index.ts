import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildCreateTweetRequest } from './default';
import { createTweetMeta, CREATE_TWEET_DESC_TEXT, getCreateTweetDefaultParams } from './desc';
import { fetchCreateTweetResponse } from './fetch';
import { normalizeCreateTweetResponse } from './normalize';
import type { CreateTweetRequest, CreateTweetResponse } from './types';

async function createTweetImpl(input: CreateTweetRequest): Promise<CreateTweetResponse> {
  const resolved = buildCreateTweetRequest(input);
  const payload = await fetchCreateTweetResponse(resolved);
  return normalizeCreateTweetResponse(payload, resolved.mode);
}

/**
 * @summary Publish a tweet via GraphQL CreateTweet in direct/reply/quote mode.
 * @param input Create-tweet request with required `tweetText` and mode-specific fields.
 * @returns Normalized publish result with mode detection and full payload in `__original`.
 * @example
 * const direct = await window.x.api.action.createTweet({
 *   tweetText: 'hello world'
 * });
 *
 * const quote = await window.x.api.action.createTweet({
 *   mode: 'quote',
 *   tweetText: 'take a look',
 *   quoteTweetId: '42'
 * });
 *
 * const reply = await window.x.api.action.createTweet({
 *   mode: 'reply',
 *   tweetText: 'thanks',
 *   inReplyToTweetId: '42'
 * });
 */
export const createTweet = createCallableApi<CreateTweetRequest, CreateTweetResponse>(createTweetImpl, {
  desc: CREATE_TWEET_DESC_TEXT,
  getDefaultParams: getCreateTweetDefaultParams,
  meta: createTweetMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
