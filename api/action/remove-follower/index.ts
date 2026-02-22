import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildRemoveFollowerRequest } from './default';
import type {
  RemoveFollowerOriginalResponse,
  RemoveFollowerRequest,
  RemoveFollowerResponse
} from './types';

const REMOVE_FOLLOWER_DOC = `# remove-follower

Remove a follower via Twitter/X GraphQL mutation RemoveFollower.

Request type: RemoveFollowerRequest
Response type: RemoveFollowerResponse

Input strategy:
- Required: targetUserId
- Defaults are stored in default.ts.
- Protocol-level customization is available via variablesOverride and request metadata overrides.

Normalized response fields:
- success: mutation branch + error state summary
- targetUserId: requested user id
- resultType/reason: mutation result summary
- __original: full GraphQL payload`;

const removeFollowerDesc: XApiDesc = {
  id: 'remove-follower',
  title: 'Remove Follower',
  doc: REMOVE_FOLLOWER_DOC,
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/RemoveFollower',
    operationName: 'RemoveFollower'
  },
  requestTypeName: 'RemoveFollowerRequest',
  responseTypeName: 'RemoveFollowerResponse'
};

async function removeFollowerImpl(input: RemoveFollowerRequest): Promise<RemoveFollowerResponse> {
  const resolved = buildRemoveFollowerRequest(input);

  const response = await fetch(resolved.endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: buildGraphqlHeaders(resolved.headers),
    body: JSON.stringify({
      operationName: resolved.operationName,
      queryId: resolved.queryId,
      variables: resolved.variables
    })
  });

  const responseText = await response.text();
  let payload: RemoveFollowerOriginalResponse;

  try {
    payload = JSON.parse(responseText) as RemoveFollowerOriginalResponse;
  } catch {
    throw new Error(
      `remove-follower returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`remove-follower failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`remove-follower failed with status ${response.status}`);
  }

  return normalizeRemoveFollowerResponse(payload, resolved.variables.target_user_id);
}

function normalizeRemoveFollowerResponse(
  payload: RemoveFollowerOriginalResponse,
  requestedUserId: string
): RemoveFollowerResponse {
  const result = payload.data?.remove_follower;
  const success = Boolean(result) && !payload.errors?.length;

  return {
    success,
    targetUserId: requestedUserId,
    resultType: result?.__typename,
    reason: result?.unfollow_success_reason,
    errors: payload.errors,
    __original: payload
  };
}

export const removeFollower = Object.assign(removeFollowerImpl, {
  __desc: removeFollowerDesc
}) as XCallableApi<RemoveFollowerRequest, RemoveFollowerResponse>;

export * from './default';
export * from './types';
