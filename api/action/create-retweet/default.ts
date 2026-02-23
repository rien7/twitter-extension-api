import type {
  CreateRetweetOperationName,
  CreateRetweetRequest,
  CreateRetweetResolvedRequest,
  CreateRetweetVariables
} from './types';

export const DEFAULT_CREATE_RETWEET_QUERY_ID = 'LFho5rIi4xcKO90p9jwG7A';

export const DEFAULT_CREATE_RETWEET_OPERATION_NAME: CreateRetweetOperationName = 'CreateRetweet';

export const DEFAULT_CREATE_RETWEET_ENDPOINT =
  `/i/api/graphql/${DEFAULT_CREATE_RETWEET_QUERY_ID}/${DEFAULT_CREATE_RETWEET_OPERATION_NAME}`;

export const DEFAULT_CREATE_RETWEET_VARIABLES: CreateRetweetVariables = {
  tweet_id: '',
  dark_request: false
};

export function buildCreateRetweetRequest(input: CreateRetweetRequest): CreateRetweetResolvedRequest {
  if (!input.tweetId) {
    throw new Error('create-retweet requires a non-empty tweetId');
  }

  const variables = mergeDefined(DEFAULT_CREATE_RETWEET_VARIABLES, input.variablesOverride);

  variables.tweet_id = input.tweetId;

  if (input.darkRequest !== undefined) {
    variables.dark_request = input.darkRequest;
  }

  const operationName = input.operationName ?? DEFAULT_CREATE_RETWEET_OPERATION_NAME;
  const queryId = input.queryId ?? DEFAULT_CREATE_RETWEET_QUERY_ID;

  return {
    endpoint: input.endpoint ?? buildCreateRetweetEndpoint(queryId, operationName),
    headers: input.headers,
    operationName,
    queryId,
    variables
  };
}

export function buildCreateRetweetEndpoint(
  queryId: string,
  operationName: CreateRetweetOperationName
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
