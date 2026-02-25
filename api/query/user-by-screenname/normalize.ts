import type {
  UserByScreenNameOriginalResponse,
  UserByScreenNameResponse,
  UserByScreenNameUnavailableUser,
  UserByScreenNameUser,
  UserByScreenNameUserResult,
  UserByScreenNameUserSummary
} from './types';

export function normalizeUserByScreenNameResponse(
  payload: UserByScreenNameOriginalResponse
): UserByScreenNameResponse {
  const result = payload.data?.user?.result;
  const user = asUserByScreenNameUser(result);
  const unavailable = asUserByScreenNameUnavailableUser(result);

  return {
    found: Boolean(user),
    resultType: getResultType(result),
    user: user ? toUserSummary(user) : undefined,
    capabilities: user
      ? {
        isBlueVerified: user.is_blue_verified,
        canDm: user.dm_permissions?.can_dm,
        canMediaTag: user.media_permissions?.can_media_tag
      }
      : undefined,
    unavailableReason:
      unavailable?.reason ?? unavailable?.message ?? unavailable?.unavailable_message,
    errors: payload.errors,
    __original: payload
  };
}

function toUserSummary(user: UserByScreenNameUser): UserByScreenNameUserSummary {
  return {
    userId: user.rest_id,
    name: user.core?.name ?? user.legacy?.name,
    screenName: user.core?.screen_name ?? user.legacy?.screen_name,
    description: user.profile_bio?.description ?? user.legacy?.description,
    location: user.location?.location,
    profileImageUrl: user.avatar?.image_url ?? user.legacy?.profile_image_url_https,
    verified: user.verification?.verified ?? user.legacy?.verified,
    protected: user.privacy?.protected ?? user.legacy?.protected,
    followersCount: user.legacy?.followers_count,
    friendsCount: user.legacy?.friends_count,
    relationship: {
      following: user.relationship_perspectives?.following,
      followedBy: user.relationship_perspectives?.followed_by,
      blocking: user.relationship_perspectives?.blocking,
      blockedBy: user.relationship_perspectives?.blocked_by,
      muting: user.relationship_perspectives?.muting,
      wantRetweets: user.legacy?.want_retweets
    }
  };
}

function asUserByScreenNameUser(result: UserByScreenNameUserResult | undefined): UserByScreenNameUser | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  const maybeUser = result as UserByScreenNameUser;
  if (
    maybeUser.__typename === 'User' ||
    typeof maybeUser.rest_id === 'string' ||
    typeof maybeUser.id === 'string' ||
    typeof maybeUser.core === 'object'
  ) {
    return maybeUser;
  }

  return undefined;
}

function asUserByScreenNameUnavailableUser(
  result: UserByScreenNameUserResult | undefined
): UserByScreenNameUnavailableUser | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  const maybeUnavailable = result as UserByScreenNameUnavailableUser;
  if (maybeUnavailable.__typename === 'UserUnavailable') {
    return maybeUnavailable;
  }

  if (
    typeof maybeUnavailable.reason === 'string' ||
    typeof maybeUnavailable.message === 'string' ||
    typeof maybeUnavailable.unavailable_message === 'string'
  ) {
    return maybeUnavailable;
  }

  return undefined;
}

function getResultType(result: UserByScreenNameUserResult | undefined): string | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  const maybeTypeName = (result as { __typename?: unknown }).__typename;
  return typeof maybeTypeName === 'string' ? maybeTypeName : undefined;
}
