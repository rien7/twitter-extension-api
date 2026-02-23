/**
 * CreateRetweet GraphQL operation name captured from live traffic.
 */
export type CreateRetweetOperationName = 'CreateRetweet';

/**
 * Request variables used by CreateRetweet GraphQL mutation.
 */
export interface CreateRetweetVariables {
  /** Source tweet id that will be retweeted. */
  tweet_id: string;
  /** Dark request flag observed in captured traffic. */
  dark_request: boolean;
}

/**
 * Public API input for create-retweet.
 *
 * `tweetId` is the only required business field.
 */
export interface CreateRetweetRequest {
  /** Source tweet id that should be retweeted. */
  tweetId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: CreateRetweetOperationName;
  /** GraphQL queryId/docId used in URL path and request body. */
  queryId?: string;
  /** Convenience override for variables.dark_request. */
  darkRequest?: boolean;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<CreateRetweetVariables>;
}

/**
 * Fully materialized request payload sent to CreateRetweet endpoint.
 */
export interface CreateRetweetResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: CreateRetweetOperationName;
  queryId: string;
  variables: CreateRetweetVariables;
}

/**
 * GraphQL error extension payload.
 */
export interface CreateRetweetGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface CreateRetweetGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: CreateRetweetGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface CreateRetweetOriginalResponse {
  data?: CreateRetweetData;
  errors?: CreateRetweetGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface CreateRetweetResponse {
  /** Whether mutation result branch exists and no GraphQL errors were returned. */
  success: boolean;
  /** Requested source tweet id passed by caller. */
  sourceTweetId: string;
  /** Server-created retweet id when present. */
  retweetId?: string;
  /** GraphQL errors array (if provided). */
  errors?: CreateRetweetGraphQLError[];
  /** Full server payload for compatibility/debugging. */
  __original: CreateRetweetOriginalResponse;
}

export interface CreateRetweetData {
  create_retweet?: CreateRetweetCreateBranch;
}

export interface CreateRetweetCreateBranch {
  retweet_results?: CreateRetweetResultBranch;
}

export interface CreateRetweetResultBranch {
  result?: CreateRetweetResult;
  __typename?: string;
}

export interface CreateRetweetResult {
  rest_id?: string;
  __typename?: string;
}
