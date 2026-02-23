import { buildGraphqlHeadersForRequest } from '../../../src/sdk/request-headers';
import type { CreateTweetOriginalResponse, CreateTweetResolvedRequest } from './types';

export async function fetchCreateTweetResponse(
  request: CreateTweetResolvedRequest
): Promise<CreateTweetOriginalResponse> {
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
      variables: request.variables,
      features: request.features
    })
  });

  const responseText = await response.text();
  let payload: CreateTweetOriginalResponse;

  try {
    payload = JSON.parse(responseText) as CreateTweetOriginalResponse;
  } catch {
    throw new Error(
      `create-tweet returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`create-tweet failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`create-tweet failed with status ${response.status}`);
  }

  return payload;
}
