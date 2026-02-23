import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type { CreateRetweetOriginalResponse, CreateRetweetResolvedRequest } from './types';

export async function fetchCreateRetweetResponse(
  request: CreateRetweetResolvedRequest
): Promise<CreateRetweetOriginalResponse> {
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
  let payload: CreateRetweetOriginalResponse;

  try {
    payload = JSON.parse(responseText) as CreateRetweetOriginalResponse;
  } catch {
    throw new Error(
      `create-retweet returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`create-retweet failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`create-retweet failed with status ${response.status}`);
  }

  return payload;
}
