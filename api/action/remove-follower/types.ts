import type { XTargetUserActionResponseBase } from '../../../src/shared/types';

/**
 * RemoveFollower GraphQL operation name captured from live traffic.
 */
export type RemoveFollowerOperationName = 'RemoveFollower';

/**
 * Request variables used by RemoveFollower mutation.
 */
export interface RemoveFollowerVariables {
  /** Target user id to remove from follower list. */
  target_user_id: string;
}

/**
 * Public API input for remove-follower action.
 */
export interface RemoveFollowerRequest {
  /** Target user id to remove from followers. */
  targetUserId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: RemoveFollowerOperationName;
  /** GraphQL queryId/docId used in URL path and request body. */
  queryId?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<RemoveFollowerVariables>;
}

/**
 * Fully materialized request payload sent to RemoveFollower endpoint.
 */
export interface RemoveFollowerResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: RemoveFollowerOperationName;
  queryId: string;
  variables: RemoveFollowerVariables;
}

export interface RemoveFollowerGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface RemoveFollowerGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: RemoveFollowerGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface RemoveFollowerOriginalResponse {
  data?: RemoveFollowerData;
  errors?: RemoveFollowerGraphQLError[];
}

/**
 * Normalized SDK response for remove-follower action.
 */
export interface RemoveFollowerResponse
  extends XTargetUserActionResponseBase<RemoveFollowerOriginalResponse, RemoveFollowerGraphQLError> {
  resultType?: string;
  reason?: string;
}

export interface RemoveFollowerData {
  remove_follower?: RemoveFollowerResult;
}

export interface RemoveFollowerResult {
  __typename?: string;
  unfollow_success_reason?: string;
}
