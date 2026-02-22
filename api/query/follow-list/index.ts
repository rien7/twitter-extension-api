import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildFollowListRequest } from './default';
import type {
  FollowListAddEntriesInstruction,
  FollowListEntry,
  FollowListInstruction,
  FollowListOriginalResponse,
  FollowListRequest,
  FollowListResolvedRequest,
  FollowListResponse,
  FollowListTimelineUser,
  FollowListTimelineUserResult,
  FollowListUserSummary
} from './types';

const FOLLOW_LIST_DOC = `# follow-list

Fetch "Following" timeline via Twitter/X GraphQL.

Request type: FollowListRequest
Response type: FollowListResponse

Input strategy:
- userId is optional; defaults to self userId from twid cookie.
- Defaults are stored in default.ts.
- Protocol-level customization is available via variablesOverride/featuresOverride.

Normalized response fields:
- instructions / entries: flattened timeline branches
- users: extracted user summaries from timeline entries
- nextCursor / prevCursor: standardized pagination cursors
- cursorTop / cursorBottom: compatibility cursor aliases
- __original: full GraphQL payload`;

const followListDesc: XApiDesc = {
  id: 'follow-list',
  title: 'Follow List',
  doc: FOLLOW_LIST_DOC,
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/Following',
    operationName: 'Following'
  },
  requestTypeName: 'FollowListRequest',
  responseTypeName: 'FollowListResponse',
  pagination: {
    strategy: 'cursor',
    countParam: 'count',
    cursorParam: 'cursor',
    nextCursorField: 'nextCursor',
    prevCursorField: 'prevCursor',
    hasMoreField: 'hasMore',
    defaultCount: 20,
    minCount: 1,
    maxCount: 100
  }
};

async function followListImpl(input: FollowListRequest = {}): Promise<FollowListResponse> {
  const resolved = buildFollowListRequest(input);
  const requestUrl = buildFollowListUrl(resolved);

  const response = await fetch(requestUrl, {
    method: 'GET',
    credentials: 'include',
    headers: buildGraphqlHeaders(resolved.headers)
  });

  const responseText = await response.text();
  let payload: FollowListOriginalResponse;

  try {
    payload = JSON.parse(responseText) as FollowListOriginalResponse;
  } catch {
    throw new Error(`follow-list returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`);
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`follow-list failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`follow-list failed with status ${response.status}`);
  }

  return normalizeFollowListResponse(payload);
}

function buildFollowListUrl(request: FollowListResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}

function normalizeFollowListResponse(payload: FollowListOriginalResponse): FollowListResponse {
  const instructions = payload.data?.user?.result?.timeline?.timeline?.instructions ?? [];
  const entries = collectTimelineEntries(instructions);
  const users: FollowListUserSummary[] = [];
  const seenUsers = new Set<string>();

  let cursorTop: string | undefined;
  let cursorBottom: string | undefined;

  for (const entry of entries) {
    const cursor = extractCursorValue(entry);
    if (cursor?.type === 'top' && !cursorTop) {
      cursorTop = cursor.value;
    }
    if (cursor?.type === 'bottom' && !cursorBottom) {
      cursorBottom = cursor.value;
    }

    const userSummary = extractUserSummary(entry);
    if (!userSummary) {
      continue;
    }

    const dedupeKey = userSummary.userId ? `user:${userSummary.userId}` : `entry:${entry.entryId}`;
    if (seenUsers.has(dedupeKey)) {
      continue;
    }

    seenUsers.add(dedupeKey);
    users.push(userSummary);
  }

  return {
    instructions,
    entries,
    users,
    cursorTop,
    cursorBottom,
    nextCursor: cursorBottom,
    prevCursor: cursorTop,
    hasMore: Boolean(cursorBottom),
    errors: payload.errors,
    __original: payload
  };
}

function collectTimelineEntries(instructions: FollowListInstruction[]): FollowListEntry[] {
  const entries: FollowListEntry[] = [];

  for (const instruction of instructions) {
    if (!isAddEntriesInstruction(instruction)) {
      continue;
    }
    entries.push(...instruction.entries);
  }

  return entries;
}

function isAddEntriesInstruction(
  instruction: FollowListInstruction
): instruction is FollowListAddEntriesInstruction {
  return instruction.type === 'TimelineAddEntries' && Array.isArray(instruction.entries);
}

function extractCursorValue(
  entry: FollowListEntry
): { type: 'top' | 'bottom'; value: string } | undefined {
  const content = entry.content as { cursorType?: string; value?: string } | undefined;
  if (!content?.cursorType || !content.value) {
    return undefined;
  }

  const normalizedCursorType = content.cursorType.toLowerCase();
  if (normalizedCursorType !== 'top' && normalizedCursorType !== 'bottom') {
    return undefined;
  }

  return {
    type: normalizedCursorType,
    value: content.value
  };
}

function extractUserSummary(entry: FollowListEntry): FollowListUserSummary | undefined {
  const content = entry.content as {
    itemContent?: {
      user_results?: {
        result?: FollowListTimelineUserResult;
      };
    };
  };

  const user = asTimelineUser(content.itemContent?.user_results?.result);
  if (!user) {
    return undefined;
  }

  return {
    entryId: entry.entryId,
    sortIndex: entry.sortIndex,
    userId: user.rest_id,
    name: user.core?.name ?? user.legacy?.name,
    screenName: user.core?.screen_name ?? user.legacy?.screen_name,
    description: user.profile_bio?.description ?? user.legacy?.description,
    location: user.location?.location,
    profileImageUrl: user.avatar?.image_url ?? user.legacy?.profile_image_url_https,
    followersCount: user.legacy?.followers_count,
    friendsCount: user.legacy?.friends_count,
    verified: user.verification?.verified ?? user.legacy?.verified,
    protected: user.privacy?.protected ?? user.legacy?.protected,
    followedBy: user.relationship_perspectives?.followed_by,
    following: user.relationship_perspectives?.following,
    blocking: user.relationship_perspectives?.blocking,
    blockedBy: user.relationship_perspectives?.blocked_by,
    muting: user.relationship_perspectives?.muting
  };
}

function asTimelineUser(result: FollowListTimelineUserResult | undefined): FollowListTimelineUser | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  const maybeUser = result as FollowListTimelineUser;
  if (maybeUser.__typename === 'User' || maybeUser.rest_id || maybeUser.core || maybeUser.legacy) {
    return maybeUser;
  }

  return undefined;
}

export const followList = Object.assign(followListImpl, {
  __desc: followListDesc
}) as XCallableApi<FollowListRequest, FollowListResponse>;

export * from './default';
export * from './types';
