import { buildGraphqlHeadersForRequest } from '../../../src/sdk/request-headers';
import type {
  UserTweetsOriginalResponse,
  UserTweetsResolvedRequest
} from './types';

export async function fetchUserTweetsResponse(
  request: UserTweetsResolvedRequest
): Promise<UserTweetsOriginalResponse> {
  const requestUrl = buildUserTweetsUrl(request);

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
  let payload: UserTweetsOriginalResponse;

  try {
    payload = JSON.parse(responseText) as UserTweetsOriginalResponse;
  } catch {
    throw new Error(
      `user-tweets returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`user-tweets failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`user-tweets failed with status ${response.status}`);
  }

  return payload;
}

function buildUserTweetsUrl(request: UserTweetsResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));
  params.set('fieldToggles', JSON.stringify(request.fieldToggles));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}
