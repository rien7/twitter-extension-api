import type { XTargetTweetActionResponseBase } from '../../../src/shared/types';

/**
 * UnfavoriteTweet GraphQL operation name captured from live traffic.
 */
export type UnfavoriteTweetOperationName = 'UnfavoriteTweet';

/**
 * Request variables used by UnfavoriteTweet GraphQL mutation.
 */
export interface UnfavoriteTweetVariables {
  /** Target tweet id to unlike. */
  tweet_id: string;
}

/**
 * Public API input for unfavorite-tweet.
 *
 * `tweetId` is the only required business field.
 */
export interface UnfavoriteTweetRequest {
  /** Target tweet id to unlike. */
  tweetId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: UnfavoriteTweetOperationName;
  /** GraphQL queryId/docId used in URL path and request body. */
  queryId?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<UnfavoriteTweetVariables>;
}

/**
 * Fully materialized request payload sent to UnfavoriteTweet endpoint.
 */
export interface UnfavoriteTweetResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: UnfavoriteTweetOperationName;
  queryId: string;
  variables: UnfavoriteTweetVariables;
}

/**
 * GraphQL error extension payload.
 */
export interface UnfavoriteTweetGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface UnfavoriteTweetGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: UnfavoriteTweetGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface UnfavoriteTweetOriginalResponse {
  data?: UnfavoriteTweetData;
  errors?: UnfavoriteTweetGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface UnfavoriteTweetResponse
  extends XTargetTweetActionResponseBase<UnfavoriteTweetOriginalResponse, UnfavoriteTweetGraphQLError> {
  /** Requested tweet id passed by caller. */
  targetTweetId: string;
  /** Server response string, usually `Done`. */
  message?: string;
}

export interface UnfavoriteTweetData {
  unfavorite_tweet?: string;
}
