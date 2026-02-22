import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type {
  FollowListOriginalResponse,
  FollowListResolvedRequest
} from './types';

export async function fetchFollowListResponse(
  request: FollowListResolvedRequest
): Promise<FollowListOriginalResponse> {
  const requestUrl = buildFollowListUrl(request);

  const response = await fetch(requestUrl, {
    method: 'GET',
    credentials: 'include',
    headers: buildGraphqlHeaders(request.headers)
  });

  const responseText = await response.text();
  let payload: FollowListOriginalResponse;

  try {
    payload = JSON.parse(responseText) as FollowListOriginalResponse;
  } catch {
    throw new Error(`follow-list returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`);
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`follow-list failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`follow-list failed with status ${response.status}`);
  }

  return payload;
}

function buildFollowListUrl(request: FollowListResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}
