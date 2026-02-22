import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildBlockRequest } from './default';
import type { BlockForm, BlockOriginalResponse, BlockRequest, BlockResponse } from './types';

const BLOCK_DOC = `# block

Block a user via Twitter/X REST endpoint blocks/create.

Request type: BlockRequest
Response type: BlockResponse

Input strategy:
- Required: userId
- Defaults are stored in default.ts.
- Protocol-level customization is available via formOverride and endpoint/headers overrides.

Normalized response fields:
- success: block action result summary
- targetUser: user summary from response
- relationship: follow/block/mute state snapshot
- __original: full REST payload`;

const blockDesc: XApiDesc = {
  id: 'block',
  title: 'Block User',
  doc: BLOCK_DOC,
  match: {
    method: 'POST',
    path: '/i/api/1.1/blocks/create.json'
  },
  requestTypeName: 'BlockRequest',
  responseTypeName: 'BlockResponse'
};

async function blockImpl(input: BlockRequest): Promise<BlockResponse> {
  const resolved = buildBlockRequest(input);

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

  return normalizeBlockResponse(payload, resolved.form.user_id);
}

function normalizeBlockResponse(payload: BlockOriginalResponse, requestedUserId: string): BlockResponse {
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

function buildFormBody(form: BlockForm): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(form)) {
    params.set(key, value);
  }

  return params.toString();
}

export const block = Object.assign(blockImpl, {
  __desc: blockDesc
}) as XCallableApi<BlockRequest, BlockResponse>;

export * from './default';
export * from './types';
