import type { DeleteBookmarkOriginalResponse, DeleteBookmarkResponse } from './types';

export function normalizeDeleteBookmarkResponse(
  payload: DeleteBookmarkOriginalResponse,
  requestedTweetId: string
): DeleteBookmarkResponse {
  const message = payload.data?.tweet_bookmark_delete;
  const success = Boolean(message) && !payload.errors?.length;

  return {
    success,
    tweetId: requestedTweetId,
    message,
    errors: payload.errors,
    __original: payload
  };
}
