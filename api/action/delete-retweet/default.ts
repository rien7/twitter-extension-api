import type {
  DeleteRetweetOperationName,
  DeleteRetweetRequest,
  DeleteRetweetResolvedRequest,
  DeleteRetweetVariables
} from './types';

export const DEFAULT_DELETE_RETWEET_QUERY_ID = 'G4MoqBiE6aqyo4QWAgCy4w';

export const DEFAULT_DELETE_RETWEET_OPERATION_NAME: DeleteRetweetOperationName = 'DeleteRetweet';

export const DEFAULT_DELETE_RETWEET_ENDPOINT =
  `/i/api/graphql/${DEFAULT_DELETE_RETWEET_QUERY_ID}/${DEFAULT_DELETE_RETWEET_OPERATION_NAME}`;

export const DEFAULT_DELETE_RETWEET_VARIABLES: DeleteRetweetVariables = {
  source_tweet_id: '',
  dark_request: false
};

export function buildDeleteRetweetRequest(input: DeleteRetweetRequest): DeleteRetweetResolvedRequest {
  if (!input.tweetId) {
    throw new Error('delete-retweet requires a non-empty tweetId');
  }

  const variables = mergeDefined(DEFAULT_DELETE_RETWEET_VARIABLES, input.variablesOverride);

  variables.source_tweet_id = input.tweetId;

  if (input.darkRequest !== undefined) {
    variables.dark_request = input.darkRequest;
  }

  const operationName = input.operationName ?? DEFAULT_DELETE_RETWEET_OPERATION_NAME;
  const queryId = input.queryId ?? DEFAULT_DELETE_RETWEET_QUERY_ID;

  return {
    endpoint: input.endpoint ?? buildDeleteRetweetEndpoint(queryId, operationName),
    headers: input.headers,
    operationName,
    queryId,
    variables
  };
}

export function buildDeleteRetweetEndpoint(
  queryId: string,
  operationName: DeleteRetweetOperationName
): string {
  return `/i/api/graphql/${queryId}/${operationName}`;
}

function mergeDefined<T extends object>(base: T, overrides?: Partial<T>): T {
  const merged = { ...base };

  if (!overrides) {
    return merged;
  }

  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const value = overrides[key];
    if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}
