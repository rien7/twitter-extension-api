import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type { CreateBookmarkOriginalResponse, CreateBookmarkResolvedRequest } from './types';

export async function fetchCreateBookmarkResponse(
  request: CreateBookmarkResolvedRequest
): Promise<CreateBookmarkOriginalResponse> {
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
  let payload: CreateBookmarkOriginalResponse;

  try {
    payload = JSON.parse(responseText) as CreateBookmarkOriginalResponse;
  } catch {
    throw new Error(
      `create-bookmark returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`create-bookmark failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`create-bookmark failed with status ${response.status}`);
  }

  return payload;
}
