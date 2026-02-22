import type { UnfollowForm, UnfollowRequest, UnfollowResolvedRequest } from './types';

export const DEFAULT_UNFOLLOW_ENDPOINT = '/i/api/1.1/friendships/destroy.json';

export const DEFAULT_UNFOLLOW_FORM: UnfollowForm = {
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
  user_id: ''
};

export function buildUnfollowRequest(input: UnfollowRequest): UnfollowResolvedRequest {
  if (!input.userId) {
    throw new Error('unfollow requires a non-empty userId');
  }

  const form = mergeDefined(DEFAULT_UNFOLLOW_FORM, input.formOverride);
  form.user_id = input.userId;

  return {
    endpoint: input.endpoint ?? DEFAULT_UNFOLLOW_ENDPOINT,
    headers: input.headers,
    form
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
