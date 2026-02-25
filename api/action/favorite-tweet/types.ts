import type { XTargetTweetActionResponseBase } from '../../../src/shared/types';

/**
 * FavoriteTweet GraphQL operation name captured from live traffic.
 */
export type FavoriteTweetOperationName = 'FavoriteTweet';

/**
 * Request variables used by FavoriteTweet GraphQL mutation.
 */
export interface FavoriteTweetVariables {
  /** Target tweet id to like. */
  tweet_id: string;
}

/**
 * Public API input for favorite-tweet.
 *
 * `tweetId` is the only required business field.
 */
export interface FavoriteTweetRequest {
  /** Target tweet id to like. */
  tweetId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: FavoriteTweetOperationName;
  /** GraphQL queryId/docId used in URL path and request body. */
  queryId?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<FavoriteTweetVariables>;
}

/**
 * Fully materialized request payload sent to FavoriteTweet endpoint.
 */
export interface FavoriteTweetResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: FavoriteTweetOperationName;
  queryId: string;
  variables: FavoriteTweetVariables;
}

/**
 * GraphQL error extension payload.
 */
export interface FavoriteTweetGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface FavoriteTweetGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: FavoriteTweetGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface FavoriteTweetOriginalResponse {
  data?: FavoriteTweetData;
  errors?: FavoriteTweetGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface FavoriteTweetResponse
  extends XTargetTweetActionResponseBase<FavoriteTweetOriginalResponse, FavoriteTweetGraphQLError> {
  /** Requested tweet id passed by caller. */
  targetTweetId: string;
  /** Server response string, usually `Done`. */
  message?: string;
}

export interface FavoriteTweetData {
  favorite_tweet?: string;
}
