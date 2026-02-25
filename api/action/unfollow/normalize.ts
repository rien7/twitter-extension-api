import type { UnfollowOriginalResponse, UnfollowResponse } from './types';

export function normalizeUnfollowResponse(
  payload: UnfollowOriginalResponse,
  requestedUserId: string
): UnfollowResponse {
  return {
    success: Boolean(payload.id_str) && !payload.errors?.length,
    targetUserId: requestedUserId,
    targetUser: {
      userId: payload.id_str,
      name: payload.name,
      screenName: payload.screen_name,
      description: payload.description,
      relationship: {
        following: payload.following,
        followedBy: payload.followed_by,
        blocking: payload.blocking,
        blockedBy: payload.blocked_by,
        muting: payload.muting,
        wantRetweets: payload.want_retweets
      }
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
