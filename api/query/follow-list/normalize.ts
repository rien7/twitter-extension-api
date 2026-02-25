import type {
  FollowListAddEntriesInstruction,
  FollowListEntry,
  FollowListInstruction,
  FollowListOriginalResponse,
  FollowListResponse,
  FollowListTimelineUser,
  FollowListTimelineUserResult,
  FollowListUserSummary
} from './types';

export function normalizeFollowListResponse(payload: FollowListOriginalResponse): FollowListResponse {
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
    relationship: {
      followedBy: user.relationship_perspectives?.followed_by,
      following: user.relationship_perspectives?.following,
      blocking: user.relationship_perspectives?.blocking,
      blockedBy: user.relationship_perspectives?.blocked_by,
      muting: user.relationship_perspectives?.muting
    }
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
