import type { FollowOriginalResponse, FollowResponse } from './types';

export function normalizeFollowResponse(
  payload: FollowOriginalResponse,
  requestedUserId: string
): FollowResponse {
  return {
    success: Boolean(payload.id_str) && !payload.errors?.length,
    userId: requestedUserId,
    targetUser: {
      id: payload.id_str,
      name: payload.name,
      screenName: payload.screen_name,
      description: payload.description
    },
    relationship: {
      following: payload.following,
      followedBy: payload.followed_by,
      blocking: payload.blocking,
      blockedBy: payload.blocked_by,
      muting: payload.muting,
      wantRetweets: payload.want_retweets
    },
    errors: payload.errors,
    __original: payload
  };
}
