import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type { FavoriteTweetOriginalResponse, FavoriteTweetResolvedRequest } from './types';

export async function fetchFavoriteTweetResponse(
  request: FavoriteTweetResolvedRequest
): Promise<FavoriteTweetOriginalResponse> {
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
  let payload: FavoriteTweetOriginalResponse;

  try {
    payload = JSON.parse(responseText) as FavoriteTweetOriginalResponse;
  } catch {
    throw new Error(
      `favorite-tweet returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`favorite-tweet failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`favorite-tweet failed with status ${response.status}`);
  }

  return payload;
}
