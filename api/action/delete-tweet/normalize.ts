import type {
  DeleteTweetOriginalResponse,
  DeleteTweetResponse
} from './types';

export function normalizeDeleteTweetResponse(
  payload: DeleteTweetOriginalResponse,
  requestedTweetId: string
): DeleteTweetResponse {
  const deletedTweetId = payload.data?.delete_tweet?.tweet_results?.result?.rest_id;
  const success = Boolean(payload.data?.delete_tweet) && !payload.errors?.length;

  return {
    success,
    tweetId: requestedTweetId,
    deletedTweetId,
    errors: payload.errors,
    __original: payload
  };
}
