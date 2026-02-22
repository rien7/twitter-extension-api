import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type {
  HomeLatestTimelineOriginalResponse,
  HomeLatestTimelineResolvedRequest
} from './types';

export async function fetchHomeLatestTimelineResponse(
  request: HomeLatestTimelineResolvedRequest
): Promise<HomeLatestTimelineOriginalResponse> {
  const response = await fetch(request.endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: buildGraphqlHeaders(request.headers),
    body: JSON.stringify({
      operationName: request.operationName,
      queryId: request.queryId,
      variables: request.variables,
      features: request.features
    })
  });

  const responseText = await response.text();
  let payload: HomeLatestTimelineOriginalResponse;

  try {
    payload = JSON.parse(responseText) as HomeLatestTimelineOriginalResponse;
  } catch {
    throw new Error(
      `home-latest-timeline returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`home-latest-timeline failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`home-latest-timeline failed with status ${response.status}`);
  }

  return payload;
}
