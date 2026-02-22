import type {
  DeleteRetweetOriginalResponse,
  DeleteRetweetResponse
} from './types';

export function normalizeDeleteRetweetResponse(
  payload: DeleteRetweetOriginalResponse,
  requestedSourceTweetId: string
): DeleteRetweetResponse {
  const unretweetedTweetId = payload.data?.unretweet?.source_tweet_results?.result?.rest_id;
  const success = Boolean(payload.data?.unretweet) && !payload.errors?.length;

  return {
    success,
    sourceTweetId: requestedSourceTweetId,
    unretweetedTweetId,
    errors: payload.errors,
    __original: payload
  };
}
