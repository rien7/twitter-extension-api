import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type { UnblockForm, UnblockOriginalResponse, UnblockResolvedRequest } from './types';

export async function fetchUnblockResponse(request: UnblockResolvedRequest): Promise<UnblockOriginalResponse> {
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
  let payload: UnblockOriginalResponse;

  try {
    payload = JSON.parse(responseText) as UnblockOriginalResponse;
  } catch {
    throw new Error(`unblock returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`);
  }

  if (!response.ok) {
    const apiErrorMessage = payload.errors?.[0]?.message;
    if (apiErrorMessage) {
      throw new Error(`unblock failed (${response.status}): ${apiErrorMessage}`);
    }
    throw new Error(`unblock failed with status ${response.status}`);
  }

  return payload;
}

function buildFormBody(form: UnblockForm): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(form)) {
    params.set(key, value);
  }

  return params.toString();
}
