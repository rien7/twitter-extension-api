import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildFollowRequest } from './default';
import type { FollowForm, FollowOriginalResponse, FollowRequest, FollowResponse } from './types';

const FOLLOW_DOC = `# follow

Follow a user via Twitter/X REST endpoint friendships/create.

Request type: FollowRequest
Response type: FollowResponse

Input strategy:
- Required: userId
- Defaults are stored in default.ts.
- Protocol-level customization is available via formOverride and endpoint/headers overrides.

Normalized response fields:
- success: follow action result summary
- targetUser: user summary from response
- relationship: follow/block/mute state snapshot
- __original: full REST payload`;

const followDesc: XApiDesc = {
  id: 'follow',
  title: 'Follow User',
  doc: FOLLOW_DOC,
  match: {
    method: 'POST',
    path: '/i/api/1.1/friendships/create.json'
  },
  requestTypeName: 'FollowRequest',
  responseTypeName: 'FollowResponse'
};

async function followImpl(input: FollowRequest): Promise<FollowResponse> {
  const resolved = buildFollowRequest(input);

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

  return normalizeFollowResponse(payload, resolved.form.user_id);
}

function normalizeFollowResponse(payload: FollowOriginalResponse, requestedUserId: string): FollowResponse {
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
      muting: payload.muting,
      wantRetweets: payload.want_retweets
    },
    errors: payload.errors,
    __original: payload
  };
}

function buildFormBody(form: FollowForm): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(form)) {
    params.set(key, value);
  }

  return params.toString();
}

export const follow = Object.assign(followImpl, {
  __desc: followDesc
}) as XCallableApi<FollowRequest, FollowResponse>;

export * from './default';
export * from './types';
