import type { FavoriteTweetOriginalResponse, FavoriteTweetResponse } from './types';

export function normalizeFavoriteTweetResponse(
  payload: FavoriteTweetOriginalResponse,
  requestedTweetId: string
): FavoriteTweetResponse {
  const message = payload.data?.favorite_tweet;
  const success = Boolean(message) && !payload.errors?.length;

  return {
    success,
    tweetId: requestedTweetId,
    message,
    errors: payload.errors,
    __original: payload
  };
}
