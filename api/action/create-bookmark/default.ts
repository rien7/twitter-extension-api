import type {
  CreateBookmarkOperationName,
  CreateBookmarkRequest,
  CreateBookmarkResolvedRequest,
  CreateBookmarkVariables
} from './types';

export const DEFAULT_CREATE_BOOKMARK_QUERY_ID = 'aoDbu3RHznuiSkQ9aNM67Q';

export const DEFAULT_CREATE_BOOKMARK_OPERATION_NAME: CreateBookmarkOperationName = 'CreateBookmark';

export const DEFAULT_CREATE_BOOKMARK_ENDPOINT =
  `/i/api/graphql/${DEFAULT_CREATE_BOOKMARK_QUERY_ID}/${DEFAULT_CREATE_BOOKMARK_OPERATION_NAME}`;

export const DEFAULT_CREATE_BOOKMARK_VARIABLES: CreateBookmarkVariables = {
  tweet_id: ''
};

export function buildCreateBookmarkRequest(input: CreateBookmarkRequest): CreateBookmarkResolvedRequest {
  if (!input.tweetId) {
    throw new Error('create-bookmark requires a non-empty tweetId');
  }

  const variables = mergeDefined(DEFAULT_CREATE_BOOKMARK_VARIABLES, input.variablesOverride);

  variables.tweet_id = input.tweetId;

  const operationName = input.operationName ?? DEFAULT_CREATE_BOOKMARK_OPERATION_NAME;
  const queryId = input.queryId ?? DEFAULT_CREATE_BOOKMARK_QUERY_ID;

  return {
    endpoint: input.endpoint ?? buildCreateBookmarkEndpoint(queryId, operationName),
    headers: input.headers,
    operationName,
    queryId,
    variables
  };
}

export function buildCreateBookmarkEndpoint(
  queryId: string,
  operationName: CreateBookmarkOperationName
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
