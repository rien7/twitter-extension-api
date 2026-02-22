/**
 * REST form fields used by blocks/destroy endpoint.
 */
export interface UnblockForm {
  user_id: string;
}

/**
 * Public API input for unblock action.
 */
export interface UnblockRequest {
  /** Target user id to unblock. */
  userId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared request headers. */
  headers?: Record<string, string>;
  /** Partial form overrides merged with defaults. */
  formOverride?: Partial<UnblockForm>;
}

/**
 * Fully materialized request payload sent to server.
 */
export interface UnblockResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  form: UnblockForm;
}

/**
 * REST error payload.
 */
export interface UnblockApiError {
  code?: number;
  message: string;
}

/**
 * Full server payload as returned by blocks/destroy.
 */
export interface UnblockOriginalResponse {
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
  errors?: UnblockApiError[];
}

/**
 * Normalized SDK response for unblock action.
 */
export interface UnblockResponse {
  success: boolean;
  userId: string;
  targetUser?: UnblockTargetUserSummary;
  relationship: UnblockRelationshipSummary;
  errors?: UnblockApiError[];
  __original: UnblockOriginalResponse;
}

export interface UnblockTargetUserSummary {
  id?: string;
  name?: string;
  screenName?: string;
  description?: string;
}

export interface UnblockRelationshipSummary {
  following?: boolean;
  followedBy?: boolean;
  blocking?: boolean;
  blockedBy?: boolean;
  muting?: boolean;
}
