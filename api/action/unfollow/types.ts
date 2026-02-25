import type {
  XTargetUserActionResponseBase,
  XUserRelationshipSummary,
  XUserSummary
} from '../../../src/shared/types';

/**
 * REST form fields used by friendships/destroy endpoint.
 */
export interface UnfollowForm {
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
 * Public API input for unfollow action.
 */
export interface UnfollowRequest {
  /** Target user id to unfollow. */
  userId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared request headers. */
  headers?: Record<string, string>;
  /** Partial form overrides merged with defaults. */
  formOverride?: Partial<UnfollowForm>;
}

/**
 * Fully materialized request payload sent to server.
 */
export interface UnfollowResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  form: UnfollowForm;
}

/**
 * REST error payload.
 */
export interface UnfollowApiError {
  code?: number;
  message: string;
}

/**
 * Full server payload as returned by friendships/destroy.
 */
export interface UnfollowOriginalResponse {
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
  errors?: UnfollowApiError[];
}

/**
 * Normalized SDK response for unfollow action.
 */
export interface UnfollowResponse
  extends XTargetUserActionResponseBase<UnfollowOriginalResponse, UnfollowApiError> {
  relationship: UnfollowRelationshipSummary;
}

export type UnfollowTargetUserSummary = XUserSummary;

export type UnfollowRelationshipSummary = XUserRelationshipSummary;
