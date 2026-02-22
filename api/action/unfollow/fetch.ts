import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type { UnfollowForm, UnfollowOriginalResponse, UnfollowResolvedRequest } from './types';

export async function fetchUnfollowResponse(
  request: UnfollowResolvedRequest
): Promise<UnfollowOriginalResponse> {
  const response = await fetch(request.endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: buildGraphqlHeaders({
      ...request.headers,
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }),
    body: buildFormBody(request.form)
  });

  const responseText = await response.text();
  let payload: UnfollowOriginalResponse;

  try {
    payload = JSON.parse(responseText) as UnfollowOriginalResponse;
  } catch {
    throw new Error(`unfollow returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`);
  }

  if (!response.ok) {
    const apiErrorMessage = payload.errors?.[0]?.message;
    if (apiErrorMessage) {
      throw new Error(`unfollow failed (${response.status}): ${apiErrorMessage}`);
    }
    throw new Error(`unfollow failed with status ${response.status}`);
  }

  return payload;
}

function buildFormBody(form: UnfollowForm): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(form)) {
    params.set(key, value);
  }

  return params.toString();
}
