import { buildGraphqlHeadersForRequest } from '../../../src/sdk/request-headers';
import type {
  BookmarksOriginalResponse,
  BookmarksResolvedRequest
} from './types';

export async function fetchBookmarksResponse(
  request: BookmarksResolvedRequest
): Promise<BookmarksOriginalResponse> {
  const requestUrl = buildBookmarksUrl(request);

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
  let payload: BookmarksOriginalResponse;

  try {
    payload = JSON.parse(responseText) as BookmarksOriginalResponse;
  } catch {
    throw new Error(
      `bookmarks returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`bookmarks failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`bookmarks failed with status ${response.status}`);
  }

  return payload;
}

function buildBookmarksUrl(request: BookmarksResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}
