import type {
  FollowersYouFollowOriginalResponse,
  FollowersYouFollowRawUser,
  FollowersYouFollowResponse,
  FollowersYouFollowUserSummary
} from './types';

export function normalizeFollowersYouFollowResponse(
  payload: FollowersYouFollowOriginalResponse
): FollowersYouFollowResponse {
  const users = (payload.users ?? []).map(toUserSummary);
  const nextCursor = normalizeCursor(payload.next_cursor_str, payload.next_cursor);
  const prevCursor = normalizeCursor(payload.previous_cursor_str, payload.previous_cursor);

  return {
    users,
    totalCount: resolveTotalCount(payload.total_count, users.length),
    cursorTop: prevCursor,
    cursorBottom: nextCursor,
    nextCursor,
    prevCursor,
    hasMore: Boolean(nextCursor),
    errors: payload.errors,
    __original: payload
  };
}

function toUserSummary(user: FollowersYouFollowRawUser): FollowersYouFollowUserSummary {
  return {
    userId: user.id_str ?? toOptionalString(user.id),
    name: user.name,
    screenName: user.screen_name,
    description: user.description,
    location: user.location,
    profileImageUrl: user.profile_image_url_https ?? user.profile_image_url,
    verified: user.verified,
    protected: user.protected,
    followersCount: user.followers_count,
    friendsCount: user.friends_count,
    relationship: {
      following: user.following,
      followedBy: user.followed_by,
      blocking: user.blocking,
      blockedBy: user.blocked_by,
      muting: user.muting,
      wantRetweets: user.want_retweets
    }
  };
}

function normalizeCursor(rawString: string | undefined, rawNumber: number | undefined): string | undefined {
  const value = rawString ?? toOptionalString(rawNumber);
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === '0') {
    return undefined;
  }

  return trimmed;
}

function resolveTotalCount(totalCount: number | undefined, fallbackCount: number): number {
  if (typeof totalCount === 'number' && Number.isFinite(totalCount) && totalCount >= 0) {
    return totalCount;
  }

  return fallbackCount;
}

function toOptionalString(value: string | number | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return String(value);
}
