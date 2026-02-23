import { buildGraphqlHeadersForRequest } from '../../../src/sdk/request-headers';
import type {
  FollowersYouFollowOriginalResponse,
  FollowersYouFollowResolvedRequest
} from './types';

export async function fetchFollowersYouFollowResponse(
  request: FollowersYouFollowResolvedRequest
): Promise<FollowersYouFollowOriginalResponse> {
  const requestUrl = buildFollowersYouFollowUrl(request);

  const response = await fetch(requestUrl, {
    method: 'GET',
    credentials: 'include',
    headers: await buildGraphqlHeadersForRequest({
      method: 'GET',
      endpoint: request.endpoint,
      headers: {
        ...request.headers,
        accept: 'application/json, text/plain, */*'
      }
    })
  });

  const responseText = await response.text();
  let payload: FollowersYouFollowOriginalResponse;

  try {
    payload = JSON.parse(responseText) as FollowersYouFollowOriginalResponse;
  } catch {
    throw new Error(
      `followers-you-follow returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const apiErrorMessage = payload.errors?.[0]?.message;
    if (apiErrorMessage) {
      throw new Error(`followers-you-follow failed (${response.status}): ${apiErrorMessage}`);
    }
    throw new Error(`followers-you-follow failed with status ${response.status}`);
  }

  return payload;
}

function buildFollowersYouFollowUrl(request: FollowersYouFollowResolvedRequest): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(request.params)) {
    params.set(key, value);
  }

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}
