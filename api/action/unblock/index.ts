import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildUnblockRequest } from './default';
import type { UnblockForm, UnblockOriginalResponse, UnblockRequest, UnblockResponse } from './types';

const UNBLOCK_DOC = `# unblock

Unblock a user via Twitter/X REST endpoint blocks/destroy.

Request type: UnblockRequest
Response type: UnblockResponse

Input strategy:
- Required: userId
- Defaults are stored in default.ts.
- Protocol-level customization is available via formOverride and endpoint/headers overrides.

Normalized response fields:
- success: unblock action result summary
- targetUser: user summary from response
- relationship: follow/block/mute state snapshot
- __original: full REST payload`;

const unblockDesc: XApiDesc = {
  id: 'unblock',
  title: 'Unblock User',
  doc: UNBLOCK_DOC,
  match: {
    method: 'POST',
    path: '/i/api/1.1/blocks/destroy.json'
  },
  requestTypeName: 'UnblockRequest',
  responseTypeName: 'UnblockResponse'
};

async function unblockImpl(input: UnblockRequest): Promise<UnblockResponse> {
  const resolved = buildUnblockRequest(input);

  const response = await fetch(resolved.endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: buildGraphqlHeaders({
      ...resolved.headers,
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }),
    body: buildFormBody(resolved.form)
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

  return normalizeUnblockResponse(payload, resolved.form.user_id);
}

function normalizeUnblockResponse(payload: UnblockOriginalResponse, requestedUserId: string): UnblockResponse {
  return {
    success: Boolean(payload.id_str) && !payload.errors?.length,
    userId: requestedUserId,
    targetUser: {
      id: payload.id_str,
      name: payload.name,
      screenName: payload.screen_name,
      description: payload.description
    },
    relationship: {
      following: payload.following,
      followedBy: payload.followed_by,
      blocking: payload.blocking,
      blockedBy: payload.blocked_by,
      muting: payload.muting
    },
    errors: payload.errors,
    __original: payload
  };
}

function buildFormBody(form: UnblockForm): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(form)) {
    params.set(key, value);
  }

  return params.toString();
}

export const unblock = Object.assign(unblockImpl, {
  __desc: unblockDesc
}) as XCallableApi<UnblockRequest, UnblockResponse>;

export * from './default';
export * from './types';
