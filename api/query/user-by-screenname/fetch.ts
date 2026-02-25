import { buildGraphqlHeadersForRequest } from '../../../src/sdk/request-headers';
import type {
  UserByScreenNameOriginalResponse,
  UserByScreenNameResolvedRequest
} from './types';

export async function fetchUserByScreenNameResponse(
  request: UserByScreenNameResolvedRequest
): Promise<UserByScreenNameOriginalResponse> {
  const requestUrl = buildUserByScreenNameUrl(request);

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
  let payload: UserByScreenNameOriginalResponse;

  try {
    payload = JSON.parse(responseText) as UserByScreenNameOriginalResponse;
  } catch {
    throw new Error(
      `user-by-screenname returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`user-by-screenname failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`user-by-screenname failed with status ${response.status}`);
  }

  return payload;
}

function buildUserByScreenNameUrl(request: UserByScreenNameResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));
  params.set('fieldToggles', JSON.stringify(request.fieldToggles));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}
