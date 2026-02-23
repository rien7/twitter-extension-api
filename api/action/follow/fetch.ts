import { buildGraphqlHeadersForRequest } from '../../../src/sdk/request-headers';
import type { FollowForm, FollowOriginalResponse, FollowResolvedRequest } from './types';

export async function fetchFollowResponse(request: FollowResolvedRequest): Promise<FollowOriginalResponse> {
  const response = await fetch(request.endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: await buildGraphqlHeadersForRequest({
      method: 'POST',
      endpoint: request.endpoint,
      headers: {
        ...request.headers,
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    }),
    body: buildFormBody(request.form)
  });

  const responseText = await response.text();
  let payload: FollowOriginalResponse;

  try {
    payload = JSON.parse(responseText) as FollowOriginalResponse;
  } catch {
    throw new Error(`follow returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`);
  }

  if (!response.ok) {
    const apiErrorMessage = payload.errors?.[0]?.message;
    if (apiErrorMessage) {
      throw new Error(`follow failed (${response.status}): ${apiErrorMessage}`);
    }
    throw new Error(`follow failed with status ${response.status}`);
  }

  return payload;
}

function buildFormBody(form: FollowForm): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(form)) {
    params.set(key, value);
  }

  return params.toString();
}
