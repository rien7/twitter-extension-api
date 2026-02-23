import type { CreateBookmarkOriginalResponse, CreateBookmarkResponse } from './types';

export function normalizeCreateBookmarkResponse(
  payload: CreateBookmarkOriginalResponse,
  requestedTweetId: string
): CreateBookmarkResponse {
  const message = payload.data?.tweet_bookmark_put;
  const success = Boolean(message) && !payload.errors?.length;

  return {
    success,
    tweetId: requestedTweetId,
    message,
    errors: payload.errors,
    __original: payload
  };
}
