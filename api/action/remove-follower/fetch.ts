import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type { RemoveFollowerOriginalResponse, RemoveFollowerResolvedRequest } from './types';

export async function fetchRemoveFollowerResponse(
  request: RemoveFollowerResolvedRequest
): Promise<RemoveFollowerOriginalResponse> {
  const response = await fetch(request.endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: buildGraphqlHeaders(request.headers),
    body: JSON.stringify({
      operationName: request.operationName,
      queryId: request.queryId,
      variables: request.variables
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

  return payload;
}
