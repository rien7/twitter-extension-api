import type {
  RemoveFollowerOperationName,
  RemoveFollowerRequest,
  RemoveFollowerResolvedRequest,
  RemoveFollowerVariables
} from './types';

export const DEFAULT_REMOVE_FOLLOWER_QUERY_ID = 'QpNfg0kpPRfjROQ_9eOLXA';

export const DEFAULT_REMOVE_FOLLOWER_OPERATION_NAME: RemoveFollowerOperationName = 'RemoveFollower';

export const DEFAULT_REMOVE_FOLLOWER_ENDPOINT = buildRemoveFollowerEndpoint(
  DEFAULT_REMOVE_FOLLOWER_QUERY_ID,
  DEFAULT_REMOVE_FOLLOWER_OPERATION_NAME
);

export const DEFAULT_REMOVE_FOLLOWER_VARIABLES: RemoveFollowerVariables = {
  target_user_id: ''
};

export function buildRemoveFollowerRequest(input: RemoveFollowerRequest): RemoveFollowerResolvedRequest {
  if (!input.targetUserId) {
    throw new Error('remove-follower requires a non-empty targetUserId');
  }

  const variables = mergeDefined(DEFAULT_REMOVE_FOLLOWER_VARIABLES, input.variablesOverride);
  variables.target_user_id = input.targetUserId;

  const operationName = input.operationName ?? DEFAULT_REMOVE_FOLLOWER_OPERATION_NAME;
  const queryId = input.queryId ?? DEFAULT_REMOVE_FOLLOWER_QUERY_ID;

  return {
    endpoint: input.endpoint ?? buildRemoveFollowerEndpoint(queryId, operationName),
    headers: input.headers,
    operationName,
    queryId,
    variables
  };
}

export function buildRemoveFollowerEndpoint(
  queryId: string,
  operationName: RemoveFollowerOperationName
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
