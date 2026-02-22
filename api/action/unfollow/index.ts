import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildUnfollowRequest } from './default';
import type {
  UnfollowForm,
  UnfollowOriginalResponse,
  UnfollowRequest,
  UnfollowResponse
} from './types';

const UNFOLLOW_DOC = `# unfollow

Unfollow a user via Twitter/X REST endpoint friendships/destroy.

Request type: UnfollowRequest
Response type: UnfollowResponse

Input strategy:
- Required: userId
- Defaults are stored in default.ts.
- Protocol-level customization is available via formOverride and endpoint/headers overrides.

Normalized response fields:
- success: unfollow action result summary
- targetUser: user summary from response
- relationship: follow/block/mute state snapshot
- __original: full REST payload`;

const unfollowDesc: XApiDesc = {
  id: 'unfollow',
  title: 'Unfollow User',
  doc: UNFOLLOW_DOC,
  match: {
    method: 'POST',
    path: '/i/api/1.1/friendships/destroy.json'
  },
  requestTypeName: 'UnfollowRequest',
  responseTypeName: 'UnfollowResponse'
};

async function unfollowImpl(input: UnfollowRequest): Promise<UnfollowResponse> {
  const resolved = buildUnfollowRequest(input);

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

  return normalizeUnfollowResponse(payload, resolved.form.user_id);
}

function normalizeUnfollowResponse(payload: UnfollowOriginalResponse, requestedUserId: string): UnfollowResponse {
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

function buildFormBody(form: UnfollowForm): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(form)) {
    params.set(key, value);
  }

  return params.toString();
}

export const unfollow = Object.assign(unfollowImpl, {
  __desc: unfollowDesc
}) as XCallableApi<UnfollowRequest, UnfollowResponse>;

export * from './default';
export * from './types';
