import type {
  FavoriteTweetOperationName,
  FavoriteTweetRequest,
  FavoriteTweetResolvedRequest,
  FavoriteTweetVariables
} from './types';

export const DEFAULT_FAVORITE_TWEET_QUERY_ID = 'lI07N6Otwv1PhnEgXILM7A';

export const DEFAULT_FAVORITE_TWEET_OPERATION_NAME: FavoriteTweetOperationName = 'FavoriteTweet';

export const DEFAULT_FAVORITE_TWEET_ENDPOINT =
  `/i/api/graphql/${DEFAULT_FAVORITE_TWEET_QUERY_ID}/${DEFAULT_FAVORITE_TWEET_OPERATION_NAME}`;

export const DEFAULT_FAVORITE_TWEET_VARIABLES: FavoriteTweetVariables = {
  tweet_id: ''
};

export function buildFavoriteTweetRequest(input: FavoriteTweetRequest): FavoriteTweetResolvedRequest {
  if (!input.tweetId) {
    throw new Error('favorite-tweet requires a non-empty tweetId');
  }

  const variables = mergeDefined(DEFAULT_FAVORITE_TWEET_VARIABLES, input.variablesOverride);

  variables.tweet_id = input.tweetId;

  const operationName = input.operationName ?? DEFAULT_FAVORITE_TWEET_OPERATION_NAME;
  const queryId = input.queryId ?? DEFAULT_FAVORITE_TWEET_QUERY_ID;

  return {
    endpoint: input.endpoint ?? buildFavoriteTweetEndpoint(queryId, operationName),
    headers: input.headers,
    operationName,
    queryId,
    variables
  };
}

export function buildFavoriteTweetEndpoint(
  queryId: string,
  operationName: FavoriteTweetOperationName
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
