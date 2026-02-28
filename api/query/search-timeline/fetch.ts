import { buildGraphqlHeadersForRequest } from '../../../src/sdk/request-headers';
import type {
  SearchTimelineOriginalResponse,
  SearchTimelineResolvedRequest
} from './types';

export async function fetchSearchTimelineResponse(
  request: SearchTimelineResolvedRequest
): Promise<SearchTimelineOriginalResponse> {
  const requestUrl = buildSearchTimelineUrl(request);

  const response = await fetch(requestUrl, {
    method: 'GET',
    credentials: 'include',
    headers: await buildGraphqlHeadersForRequest({
      method: 'GET',
      endpoint: request.endpoint,
      headers: request.headers
    })
  });

  const responseText = await response.text();
  let payload: SearchTimelineOriginalResponse;

  try {
    payload = JSON.parse(responseText) as SearchTimelineOriginalResponse;
  } catch {
    throw new Error(
      `search-timeline returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`search-timeline failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`search-timeline failed with status ${response.status}`);
  }

  return payload;
}

function buildSearchTimelineUrl(request: SearchTimelineResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}
