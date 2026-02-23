import { buildGraphqlHeadersForRequest } from '../../../src/sdk/request-headers';
import type { DeleteRetweetOriginalResponse, DeleteRetweetResolvedRequest } from './types';

export async function fetchDeleteRetweetResponse(
  request: DeleteRetweetResolvedRequest
): Promise<DeleteRetweetOriginalResponse> {
  const response = await fetch(request.endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: await buildGraphqlHeadersForRequest({
      method: 'POST',
      endpoint: request.endpoint,
      headers: request.headers
    }),
    body: JSON.stringify({
      operationName: request.operationName,
      queryId: request.queryId,
      variables: request.variables
    })
  });

  const responseText = await response.text();
  let payload: DeleteRetweetOriginalResponse;

  try {
    payload = JSON.parse(responseText) as DeleteRetweetOriginalResponse;
  } catch {
    throw new Error(
      `delete-retweet returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`delete-retweet failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`delete-retweet failed with status ${response.status}`);
  }

  return payload;
}
