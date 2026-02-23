import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildFavoriteTweetRequest } from './default';
import {
  favoriteTweetMeta,
  FAVORITE_TWEET_DESC_TEXT,
  getFavoriteTweetDefaultParams
} from './desc';
import { fetchFavoriteTweetResponse } from './fetch';
import { normalizeFavoriteTweetResponse } from './normalize';
import type { FavoriteTweetRequest, FavoriteTweetResponse } from './types';

async function favoriteTweetImpl(input: FavoriteTweetRequest): Promise<FavoriteTweetResponse> {
  const resolved = buildFavoriteTweetRequest(input);
  const payload = await fetchFavoriteTweetResponse(resolved);
  return normalizeFavoriteTweetResponse(payload, resolved.variables.tweet_id);
}

/**
 * @summary Like a tweet via GraphQL FavoriteTweet mutation.
 * @param input Favorite request with required `tweetId`.
 * @returns Normalized like result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.favoriteTweet({ tweetId: '42' });
 */
export const favoriteTweet = createCallableApi<FavoriteTweetRequest, FavoriteTweetResponse>(
  favoriteTweetImpl,
  {
    desc: FAVORITE_TWEET_DESC_TEXT,
    getDefaultParams: getFavoriteTweetDefaultParams,
    meta: favoriteTweetMeta
  }
);

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
