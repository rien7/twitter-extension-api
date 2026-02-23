import type { CreateRetweetOriginalResponse, CreateRetweetResponse } from './types';

export function normalizeCreateRetweetResponse(
  payload: CreateRetweetOriginalResponse,
  requestedSourceTweetId: string
): CreateRetweetResponse {
  const retweetId = payload.data?.create_retweet?.retweet_results?.result?.rest_id;
  const success = Boolean(payload.data?.create_retweet) && !payload.errors?.length;

  return {
    success,
    sourceTweetId: requestedSourceTweetId,
    retweetId,
    errors: payload.errors,
    __original: payload
  };
}
