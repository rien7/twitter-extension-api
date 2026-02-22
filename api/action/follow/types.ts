/**
 * REST form fields used by friendships/create endpoint.
 */
export interface FollowForm {
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
  user_id: string;
}

/**
 * Public API input for follow action.
 */
export interface FollowRequest {
  /** Target user id to follow. */
  userId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared request headers. */
  headers?: Record<string, string>;
  /** Partial form overrides merged with defaults. */
  formOverride?: Partial<FollowForm>;
}

/**
 * Fully materialized request payload sent to server.
 */
export interface FollowResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  form: FollowForm;
}

/**
 * REST error payload.
 */
export interface FollowApiError {
  code?: number;
  message: string;
}

/**
 * Full server payload as returned by friendships/create.
 */
export interface FollowOriginalResponse {
  id?: number;
  id_str?: string;
  name?: string;
  screen_name?: string;
  description?: string;
  following?: boolean;
  followed_by?: boolean;
  blocking?: boolean;
  blocked_by?: boolean;
  muting?: boolean;
  want_retweets?: boolean;
  errors?: FollowApiError[];
}

/**
 * Normalized SDK response for follow action.
 */
export interface FollowResponse {
  success: boolean;
  userId: string;
  targetUser?: FollowTargetUserSummary;
  relationship: FollowRelationshipSummary;
  errors?: FollowApiError[];
  __original: FollowOriginalResponse;
}

export interface FollowTargetUserSummary {
  id?: string;
  name?: string;
  screenName?: string;
  description?: string;
}

export interface FollowRelationshipSummary {
  following?: boolean;
  followedBy?: boolean;
  blocking?: boolean;
  blockedBy?: boolean;
  muting?: boolean;
  wantRetweets?: boolean;
}
