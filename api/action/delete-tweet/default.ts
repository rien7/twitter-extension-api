import type {
  DeleteTweetOperationName,
  DeleteTweetRequest,
  DeleteTweetResolvedRequest,
  DeleteTweetVariables
} from './types';

export const DEFAULT_DELETE_TWEET_QUERY_ID = 'VaenaVgh5q5ih7kvyVjgtg';

export const DEFAULT_DELETE_TWEET_OPERATION_NAME: DeleteTweetOperationName = 'DeleteTweet';

export const DEFAULT_DELETE_TWEET_ENDPOINT =
  `/i/api/graphql/${DEFAULT_DELETE_TWEET_QUERY_ID}/${DEFAULT_DELETE_TWEET_OPERATION_NAME}`;

export const DEFAULT_DELETE_TWEET_VARIABLES: DeleteTweetVariables = {
  tweet_id: '',
  dark_request: false
};

export function buildDeleteTweetRequest(input: DeleteTweetRequest): DeleteTweetResolvedRequest {
  if (!input.tweetId) {
    throw new Error('delete-tweet requires a non-empty tweetId');
  }

  const variables = mergeDefined(DEFAULT_DELETE_TWEET_VARIABLES, input.variablesOverride);

  variables.tweet_id = input.tweetId;

  if (input.darkRequest !== undefined) {
    variables.dark_request = input.darkRequest;
  }

  const operationName = input.operationName ?? DEFAULT_DELETE_TWEET_OPERATION_NAME;
  const queryId = input.queryId ?? DEFAULT_DELETE_TWEET_QUERY_ID;

  return {
    endpoint: input.endpoint ?? buildDeleteTweetEndpoint(queryId, operationName),
    headers: input.headers,
    operationName,
    queryId,
    variables
  };
}

export function buildDeleteTweetEndpoint(
  queryId: string,
  operationName: DeleteTweetOperationName
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
