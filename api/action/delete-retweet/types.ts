import type { XTargetTweetActionResponseBase } from '../../../src/shared/types';

/**
 * DeleteRetweet GraphQL operation name captured from live traffic.
 */
export type DeleteRetweetOperationName = 'DeleteRetweet';

/**
 * Request variables used by DeleteRetweet GraphQL mutation.
 */
export interface DeleteRetweetVariables {
  /** Source tweet id whose retweet relation should be removed. */
  source_tweet_id: string;
  /** Dark request flag observed in captured traffic. */
  dark_request: boolean;
}

/**
 * Public API input for delete-retweet.
 *
 * `tweetId` is the only required business field.
 */
export interface DeleteRetweetRequest {
  /** Source tweet id whose retweet should be removed. */
  tweetId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: DeleteRetweetOperationName;
  /** GraphQL queryId/docId used in URL path and request body. */
  queryId?: string;
  /** Convenience override for variables.dark_request. */
  darkRequest?: boolean;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<DeleteRetweetVariables>;
}

/**
 * Fully materialized request payload sent to DeleteRetweet endpoint.
 */
export interface DeleteRetweetResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: DeleteRetweetOperationName;
  queryId: string;
  variables: DeleteRetweetVariables;
}

/**
 * GraphQL error extension payload.
 */
export interface DeleteRetweetGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface DeleteRetweetGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: DeleteRetweetGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface DeleteRetweetOriginalResponse {
  data?: DeleteRetweetData;
  errors?: DeleteRetweetGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface DeleteRetweetResponse
  extends XTargetTweetActionResponseBase<DeleteRetweetOriginalResponse, DeleteRetweetGraphQLError> {
  /** Requested source tweet id passed by caller. */
  targetTweetId: string;
  /** Server-confirmed source tweet id when present. */
  resultTweetId?: string;
}

export interface DeleteRetweetData {
  unretweet?: DeleteRetweetUnretweetBranch;
}

export interface DeleteRetweetUnretweetBranch {
  source_tweet_results?: DeleteRetweetSourceTweetResults;
}

export interface DeleteRetweetSourceTweetResults {
  result?: DeleteRetweetSourceTweetResult;
  __typename?: string;
  [key: string]: unknown;
}

export interface DeleteRetweetSourceTweetResult {
  rest_id?: string;
  __typename?: string;
  [key: string]: unknown;
}
