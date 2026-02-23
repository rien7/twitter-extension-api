import { buildGraphqlHeadersForRequest } from '../../../src/sdk/request-headers';
import type {
  TweetDetailOriginalResponse,
  TweetDetailResolvedRequest
} from './types';

export async function fetchTweetDetailResponse(
  request: TweetDetailResolvedRequest
): Promise<TweetDetailOriginalResponse> {
  const requestUrl = buildTweetDetailUrl(request);

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
  let payload: TweetDetailOriginalResponse;

  try {
    payload = JSON.parse(responseText) as TweetDetailOriginalResponse;
  } catch {
    throw new Error(
      `tweet-detail returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`tweet-detail failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`tweet-detail failed with status ${response.status}`);
  }

  return payload;
}

function buildTweetDetailUrl(request: TweetDetailResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));
  params.set('fieldToggles', JSON.stringify(request.fieldToggles));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}
