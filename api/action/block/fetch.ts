import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type { BlockForm, BlockOriginalResponse, BlockResolvedRequest } from './types';

export async function fetchBlockResponse(request: BlockResolvedRequest): Promise<BlockOriginalResponse> {
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
  let payload: BlockOriginalResponse;

  try {
    payload = JSON.parse(responseText) as BlockOriginalResponse;
  } catch {
    throw new Error(`block returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`);
  }

  if (!response.ok) {
    const apiErrorMessage = payload.errors?.[0]?.message;
    if (apiErrorMessage) {
      throw new Error(`block failed (${response.status}): ${apiErrorMessage}`);
    }
    throw new Error(`block failed with status ${response.status}`);
  }

  return payload;
}

function buildFormBody(form: BlockForm): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(form)) {
    params.set(key, value);
  }

  return params.toString();
}
