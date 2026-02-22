import type { RemoveFollowerOriginalResponse, RemoveFollowerResponse } from './types';

export function normalizeRemoveFollowerResponse(
  payload: RemoveFollowerOriginalResponse,
  requestedUserId: string
): RemoveFollowerResponse {
  const result = payload.data?.remove_follower;
  const success = Boolean(result) && !payload.errors?.length;

  return {
    success,
    targetUserId: requestedUserId,
    resultType: result?.__typename,
    reason: result?.unfollow_success_reason,
    errors: payload.errors,
    __original: payload
  };
}
