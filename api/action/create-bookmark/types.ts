import type { XTargetTweetActionResponseBase } from '../../../src/shared/types';

/**
 * CreateBookmark GraphQL operation name captured from live traffic.
 */
export type CreateBookmarkOperationName = 'CreateBookmark';

/**
 * Request variables used by CreateBookmark GraphQL mutation.
 */
export interface CreateBookmarkVariables {
  /** Target tweet id to bookmark. */
  tweet_id: string;
}

/**
 * Public API input for create-bookmark.
 *
 * `tweetId` is the only required business field.
 */
export interface CreateBookmarkRequest {
  /** Target tweet id to bookmark. */
  tweetId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: CreateBookmarkOperationName;
  /** GraphQL queryId/docId used in URL path and request body. */
  queryId?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<CreateBookmarkVariables>;
}

/**
 * Fully materialized request payload sent to CreateBookmark endpoint.
 */
export interface CreateBookmarkResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: CreateBookmarkOperationName;
  queryId: string;
  variables: CreateBookmarkVariables;
}

/**
 * GraphQL error extension payload.
 */
export interface CreateBookmarkGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface CreateBookmarkGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: CreateBookmarkGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface CreateBookmarkOriginalResponse {
  data?: CreateBookmarkData;
  errors?: CreateBookmarkGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface CreateBookmarkResponse
  extends XTargetTweetActionResponseBase<CreateBookmarkOriginalResponse, CreateBookmarkGraphQLError> {
  /** Requested tweet id passed by caller. */
  targetTweetId: string;
  /** Server response string, usually `Done`. */
  message?: string;
}

export interface CreateBookmarkData {
  tweet_bookmark_put?: string;
}
