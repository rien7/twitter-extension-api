/**
 * REST form fields used by blocks/create endpoint.
 */
export interface BlockForm {
  user_id: string;
}

/**
 * Public API input for block action.
 */
export interface BlockRequest {
  /** Target user id to block. */
  userId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared request headers. */
  headers?: Record<string, string>;
  /** Partial form overrides merged with defaults. */
  formOverride?: Partial<BlockForm>;
}

/**
 * Fully materialized request payload sent to server.
 */
export interface BlockResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  form: BlockForm;
}

/**
 * REST error payload.
 */
export interface BlockApiError {
  code?: number;
  message: string;
}

/**
 * Full server payload as returned by blocks/create.
 */
export interface BlockOriginalResponse {
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
  errors?: BlockApiError[];
}

/**
 * Normalized SDK response for block action.
 */
export interface BlockResponse {
  success: boolean;
  userId: string;
  targetUser?: BlockTargetUserSummary;
  relationship: BlockRelationshipSummary;
  errors?: BlockApiError[];
  __original: BlockOriginalResponse;
}

export interface BlockTargetUserSummary {
  id?: string;
  name?: string;
  screenName?: string;
  description?: string;
}

export interface BlockRelationshipSummary {
  following?: boolean;
  followedBy?: boolean;
  blocking?: boolean;
  blockedBy?: boolean;
  muting?: boolean;
}
