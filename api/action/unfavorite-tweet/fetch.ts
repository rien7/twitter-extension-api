import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type { UnfavoriteTweetOriginalResponse, UnfavoriteTweetResolvedRequest } from './types';

export async function fetchUnfavoriteTweetResponse(
  request: UnfavoriteTweetResolvedRequest
): Promise<UnfavoriteTweetOriginalResponse> {
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
  let payload: UnfavoriteTweetOriginalResponse;

  try {
    payload = JSON.parse(responseText) as UnfavoriteTweetOriginalResponse;
  } catch {
    throw new Error(
      `unfavorite-tweet returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`unfavorite-tweet failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`unfavorite-tweet failed with status ${response.status}`);
  }

  return payload;
}
