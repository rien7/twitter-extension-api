import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type {
  UserTweetsAndRepliesOriginalResponse,
  UserTweetsAndRepliesResolvedRequest
} from './types';

export async function fetchUserTweetsAndRepliesResponse(
  request: UserTweetsAndRepliesResolvedRequest
): Promise<UserTweetsAndRepliesOriginalResponse> {
  const requestUrl = buildUserTweetsAndRepliesUrl(request);

  const response = await fetch(requestUrl, {
    method: 'GET',
    credentials: 'include',
    headers: buildGraphqlHeaders(request.headers)
  });

  const responseText = await response.text();
  let payload: UserTweetsAndRepliesOriginalResponse;

  try {
    payload = JSON.parse(responseText) as UserTweetsAndRepliesOriginalResponse;
  } catch {
    throw new Error(
      `user-tweets-and-replies returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`user-tweets-and-replies failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`user-tweets-and-replies failed with status ${response.status}`);
  }

  return payload;
}

function buildUserTweetsAndRepliesUrl(request: UserTweetsAndRepliesResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));
  params.set('fieldToggles', JSON.stringify(request.fieldToggles));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}
