import type { XUserSummary } from '../../../src/shared/types';

/**
 * URL query params used by friends/following/list endpoint.
 */
export interface FollowersYouFollowQueryParams {
  include_profile_interstitial_type: string;
  include_blocking: string;
  include_blocked_by: string;
  include_followed_by: string;
  include_want_retweets: string;
  include_mute_edge: string;
  include_can_dm: string;
  include_can_media_tag: string;
  include_ext_is_blue_verified: string;
  include_ext_verified_type: string;
  include_ext_profile_image_shape: string;
  skip_status: string;
  cursor: string;
  user_id: string;
  count: string;
  with_total_count: string;
}

/**
 * Public API input for followers-you-follow query.
 */
export interface FollowersYouFollowRequest {
  /**
   * Target user id for hover card context.
   * Defaults to self user id parsed from `twid` cookie.
   */
  userId?: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared request headers. */
  headers?: Record<string, string>;
  /** Convenience override for query param `count`. */
  count?: number;
  /** Convenience override for query param `cursor`. */
  cursor?: string;
  /** Convenience override for query param `with_total_count`. */
  withTotalCount?: boolean;
  /** Partial query param overrides merged with defaults. */
  paramsOverride?: Partial<FollowersYouFollowQueryParams>;
}

/**
 * Fully materialized request payload sent to server.
 */
export interface FollowersYouFollowResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  params: FollowersYouFollowQueryParams;
}

/**
 * REST error payload.
 */
export interface FollowersYouFollowApiError {
  code?: number;
  message: string;
}

/**
 * Minimal user shape returned by friends/following/list endpoint.
 */
export interface FollowersYouFollowRawUser {
  id?: number;
  id_str?: string;
  name?: string;
  screen_name?: string;
  description?: string;
  location?: string;
  profile_image_url?: string;
  profile_image_url_https?: string;
  verified?: boolean;
  protected?: boolean;
  followers_count?: number;
  friends_count?: number;
  following?: boolean;
  followed_by?: boolean;
  blocking?: boolean;
  blocked_by?: boolean;
  muting?: boolean;
  want_retweets?: boolean;
}

/**
 * Full server payload as returned by friends/following/list.
 */
export interface FollowersYouFollowOriginalResponse {
  users?: FollowersYouFollowRawUser[];
  next_cursor?: number;
  next_cursor_str?: string;
  previous_cursor?: number;
  previous_cursor_str?: string;
  total_count?: number;
  errors?: FollowersYouFollowApiError[];
}

/**
 * Normalized user summary for hover-card display.
 */
export type FollowersYouFollowUserSummary = XUserSummary;

/**
 * Normalized SDK response for followers-you-follow query.
 */
export interface FollowersYouFollowResponse {
  users: FollowersYouFollowUserSummary[];
  totalCount: number;
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  errors?: FollowersYouFollowApiError[];
  __original: FollowersYouFollowOriginalResponse;
}
