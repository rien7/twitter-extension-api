import type {
  UnfavoriteTweetOriginalResponse,
  UnfavoriteTweetResponse
} from './types';

export function normalizeUnfavoriteTweetResponse(
  payload: UnfavoriteTweetOriginalResponse,
  requestedTweetId: string
): UnfavoriteTweetResponse {
  const message = payload.data?.unfavorite_tweet;
  const success = Boolean(message) && !payload.errors?.length;

  return {
    success,
    tweetId: requestedTweetId,
    message,
    errors: payload.errors,
    __original: payload
  };
}
