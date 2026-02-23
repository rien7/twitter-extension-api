import type {
  DeleteBookmarkOperationName,
  DeleteBookmarkRequest,
  DeleteBookmarkResolvedRequest,
  DeleteBookmarkVariables
} from './types';

export const DEFAULT_DELETE_BOOKMARK_QUERY_ID = 'Wlmlj2-xzyS1GN3a6cj-mQ';

export const DEFAULT_DELETE_BOOKMARK_OPERATION_NAME: DeleteBookmarkOperationName = 'DeleteBookmark';

export const DEFAULT_DELETE_BOOKMARK_ENDPOINT =
  `/i/api/graphql/${DEFAULT_DELETE_BOOKMARK_QUERY_ID}/${DEFAULT_DELETE_BOOKMARK_OPERATION_NAME}`;

export const DEFAULT_DELETE_BOOKMARK_VARIABLES: DeleteBookmarkVariables = {
  tweet_id: ''
};

export function buildDeleteBookmarkRequest(input: DeleteBookmarkRequest): DeleteBookmarkResolvedRequest {
  if (!input.tweetId) {
    throw new Error('delete-bookmark requires a non-empty tweetId');
  }

  const variables = mergeDefined(DEFAULT_DELETE_BOOKMARK_VARIABLES, input.variablesOverride);

  variables.tweet_id = input.tweetId;

  const operationName = input.operationName ?? DEFAULT_DELETE_BOOKMARK_OPERATION_NAME;
  const queryId = input.queryId ?? DEFAULT_DELETE_BOOKMARK_QUERY_ID;

  return {
    endpoint: input.endpoint ?? buildDeleteBookmarkEndpoint(queryId, operationName),
    headers: input.headers,
    operationName,
    queryId,
    variables
  };
}

export function buildDeleteBookmarkEndpoint(
  queryId: string,
  operationName: DeleteBookmarkOperationName
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
