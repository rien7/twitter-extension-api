import type { XTargetTweetActionResponseBase } from '../../../src/shared/types';

/**
 * DeleteTweet GraphQL operation name captured from live traffic.
 */
export type DeleteTweetOperationName = 'DeleteTweet';

/**
 * Request variables used by DeleteTweet GraphQL mutation.
 */
export interface DeleteTweetVariables {
  /** Target tweet id to delete. */
  tweet_id: string;
  /** Dark request flag observed in captured traffic. */
  dark_request: boolean;
}

/**
 * Public API input for delete-tweet.
 *
 * `tweetId` is the only required business field.
 */
export interface DeleteTweetRequest {
  /** Target tweet id to delete. */
  tweetId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: DeleteTweetOperationName;
  /** GraphQL queryId/docId used in URL path and request body. */
  queryId?: string;
  /** Convenience override for variables.dark_request. */
  darkRequest?: boolean;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<DeleteTweetVariables>;
}

/**
 * Fully materialized request payload sent to DeleteTweet endpoint.
 */
export interface DeleteTweetResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: DeleteTweetOperationName;
  queryId: string;
  variables: DeleteTweetVariables;
}

/**
 * GraphQL error extension payload.
 */
export interface DeleteTweetGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface DeleteTweetGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: DeleteTweetGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface DeleteTweetOriginalResponse {
  data?: DeleteTweetData;
  errors?: DeleteTweetGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface DeleteTweetResponse
  extends XTargetTweetActionResponseBase<DeleteTweetOriginalResponse, DeleteTweetGraphQLError> {
  /** Requested tweet id passed by caller. */
  targetTweetId: string;
  /** Deleted tweet id extracted from server response when present. */
  resultTweetId?: string;
}

export interface DeleteTweetData {
  delete_tweet?: DeleteTweetDeleteBranch;
}

export interface DeleteTweetDeleteBranch {
  tweet_results?: DeleteTweetTweetResults;
}

export interface DeleteTweetTweetResults {
  result?: DeleteTweetDeletedTweet;
  __typename?: string;
  [key: string]: unknown;
}

export interface DeleteTweetDeletedTweet {
  rest_id?: string;
  __typename?: string;
  [key: string]: unknown;
}
