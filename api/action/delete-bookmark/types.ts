/**
 * DeleteBookmark GraphQL operation name captured from live traffic.
 */
export type DeleteBookmarkOperationName = 'DeleteBookmark';

/**
 * Request variables used by DeleteBookmark GraphQL mutation.
 */
export interface DeleteBookmarkVariables {
  /** Target tweet id to remove from bookmarks. */
  tweet_id: string;
}

/**
 * Public API input for delete-bookmark.
 *
 * `tweetId` is the only required business field.
 */
export interface DeleteBookmarkRequest {
  /** Target tweet id to remove from bookmarks. */
  tweetId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: DeleteBookmarkOperationName;
  /** GraphQL queryId/docId used in URL path and request body. */
  queryId?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<DeleteBookmarkVariables>;
}

/**
 * Fully materialized request payload sent to DeleteBookmark endpoint.
 */
export interface DeleteBookmarkResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: DeleteBookmarkOperationName;
  queryId: string;
  variables: DeleteBookmarkVariables;
}

/**
 * GraphQL error extension payload.
 */
export interface DeleteBookmarkGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface DeleteBookmarkGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: DeleteBookmarkGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface DeleteBookmarkOriginalResponse {
  data?: DeleteBookmarkData;
  errors?: DeleteBookmarkGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface DeleteBookmarkResponse {
  /** Whether delete-bookmark response string exists and no GraphQL errors were returned. */
  success: boolean;
  /** Requested tweet id passed by caller. */
  tweetId: string;
  /** Server response string, usually `Done`. */
  message?: string;
  /** GraphQL errors array (if provided). */
  errors?: DeleteBookmarkGraphQLError[];
  /** Full server payload for compatibility/debugging. */
  __original: DeleteBookmarkOriginalResponse;
}

export interface DeleteBookmarkData {
  tweet_bookmark_delete?: string;
}
