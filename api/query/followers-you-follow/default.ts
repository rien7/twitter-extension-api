import { resolveSelfUserIdOrThrow } from '../../../src/sdk/self-user-id';
import type {
  FollowersYouFollowQueryParams,
  FollowersYouFollowRequest,
  FollowersYouFollowResolvedRequest
} from './types';

export const DEFAULT_FOLLOWERS_YOU_FOLLOW_ENDPOINT = '/i/api/1.1/friends/following/list.json';

export const DEFAULT_FOLLOWERS_YOU_FOLLOW_PARAMS: FollowersYouFollowQueryParams = {
  include_profile_interstitial_type: '1',
  include_blocking: '1',
  include_blocked_by: '1',
  include_followed_by: '1',
  include_want_retweets: '1',
  include_mute_edge: '1',
  include_can_dm: '1',
  include_can_media_tag: '1',
  include_ext_is_blue_verified: '1',
  include_ext_verified_type: '1',
  include_ext_profile_image_shape: '1',
  skip_status: '1',
  cursor: '-1',
  user_id: '',
  count: '3',
  with_total_count: 'true'
};

export function buildFollowersYouFollowRequest(
  input: FollowersYouFollowRequest = {}
): FollowersYouFollowResolvedRequest {
  const params = mergeDefined(DEFAULT_FOLLOWERS_YOU_FOLLOW_PARAMS, input.paramsOverride);
  params.user_id = resolveTargetUserId(input.userId);

  if (input.count !== undefined) {
    if (!Number.isFinite(input.count) || Math.trunc(input.count) <= 0) {
      throw new Error('followers-you-follow count must be a positive integer');
    }
    params.count = String(Math.trunc(input.count));
  }

  if (input.cursor !== undefined) {
    params.cursor = input.cursor;
  }

  if (input.withTotalCount !== undefined) {
    params.with_total_count = input.withTotalCount ? 'true' : 'false';
  }

  return {
    endpoint: input.endpoint ?? DEFAULT_FOLLOWERS_YOU_FOLLOW_ENDPOINT,
    headers: input.headers,
    params
  };
}

function mergeDefined<T extends object>(base: T, overrides?: Partial<T>): T {
  const merged = { ...base };

  if (!overrides) {
    return merged;
  }

  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const value = overrides[key];
    if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}

function resolveTargetUserId(inputUserId: string | undefined): string {
  const explicitUserId = inputUserId?.trim();
  if (explicitUserId) {
    return explicitUserId;
  }

  return resolveSelfUserIdOrThrow('followers-you-follow');
}
