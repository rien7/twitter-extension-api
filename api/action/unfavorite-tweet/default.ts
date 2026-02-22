import type {
  UnfavoriteTweetOperationName,
  UnfavoriteTweetRequest,
  UnfavoriteTweetResolvedRequest,
  UnfavoriteTweetVariables
} from './types';

export const DEFAULT_UNFAVORITE_TWEET_QUERY_ID = 'ZYKSe-w7KEslx3JhSIk5LA';

export const DEFAULT_UNFAVORITE_TWEET_OPERATION_NAME: UnfavoriteTweetOperationName =
  'UnfavoriteTweet';

export const DEFAULT_UNFAVORITE_TWEET_ENDPOINT =
  `/i/api/graphql/${DEFAULT_UNFAVORITE_TWEET_QUERY_ID}/${DEFAULT_UNFAVORITE_TWEET_OPERATION_NAME}`;

export const DEFAULT_UNFAVORITE_TWEET_VARIABLES: UnfavoriteTweetVariables = {
  tweet_id: ''
};

export function buildUnfavoriteTweetRequest(
  input: UnfavoriteTweetRequest
): UnfavoriteTweetResolvedRequest {
  if (!input.tweetId) {
    throw new Error('unfavorite-tweet requires a non-empty tweetId');
  }

  const variables = mergeDefined(DEFAULT_UNFAVORITE_TWEET_VARIABLES, input.variablesOverride);

  variables.tweet_id = input.tweetId;

  const operationName = input.operationName ?? DEFAULT_UNFAVORITE_TWEET_OPERATION_NAME;
  const queryId = input.queryId ?? DEFAULT_UNFAVORITE_TWEET_QUERY_ID;

  return {
    endpoint: input.endpoint ?? buildUnfavoriteTweetEndpoint(queryId, operationName),
    headers: input.headers,
    operationName,
    queryId,
    variables
  };
}

export function buildUnfavoriteTweetEndpoint(
  queryId: string,
  operationName: UnfavoriteTweetOperationName
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
