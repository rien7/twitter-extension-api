import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type {
  LikesOriginalResponse,
  LikesResolvedRequest
} from './types';

export async function fetchLikesResponse(request: LikesResolvedRequest): Promise<LikesOriginalResponse> {
  const requestUrl = buildLikesUrl(request);

  const response = await fetch(requestUrl, {
    method: 'GET',
    credentials: 'include',
    headers: buildGraphqlHeaders(request.headers)
  });

  const responseText = await response.text();
  let payload: LikesOriginalResponse;

  try {
    payload = JSON.parse(responseText) as LikesOriginalResponse;
  } catch {
    throw new Error(`likes returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`);
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`likes failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`likes failed with status ${response.status}`);
  }

  return payload;
}

function buildLikesUrl(request: LikesResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));
  params.set('fieldToggles', JSON.stringify(request.fieldToggles));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}
