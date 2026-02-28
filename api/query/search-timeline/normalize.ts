import type {
  SearchTimelineAddEntriesInstruction,
  SearchTimelineAddToModuleInstruction,
  SearchTimelineEntry,
  SearchTimelineInstruction,
  SearchTimelineList,
  SearchTimelineListSummary,
  SearchTimelineModuleItem,
  SearchTimelineOriginalResponse,
  SearchTimelineReplaceEntryInstruction,
  SearchTimelineResolvedRequest,
  SearchTimelineResponse,
  SearchTimelineTimelineItemContent,
  SearchTimelineTweet,
  SearchTimelineTweetResult,
  SearchTimelineTweetSummary,
  SearchTimelineTweetWithVisibilityResults,
  SearchTimelineUser,
  SearchTimelineUserSummary
} from './types';

interface SearchTimelineItemContentContext {
  entryId: string;
  sortIndex?: string;
  itemContent: SearchTimelineTimelineItemContent;
}

export function normalizeSearchTimelineResponse(
  payload: SearchTimelineOriginalResponse,
  request: SearchTimelineResolvedRequest
): SearchTimelineResponse {
  const instructions = payload.data?.search_by_raw_query?.search_timeline?.timeline?.instructions ?? [];
  const entries = collectTimelineEntries(instructions);
  const conversationTweetIdSet = new Set<string>();
  const tweetSummaries: SearchTimelineTweetSummary[] = [];
  const userSummaries: SearchTimelineUserSummary[] = [];
  const listSummaries: SearchTimelineListSummary[] = [];

  const tweetDedupeSet = new Set<string>();
  const userDedupeSet = new Set<string>();
  const listDedupeSet = new Set<string>();

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

    collectConversationTweetIdsFromEntry(entry, conversationTweetIdSet);

    for (const context of collectItemContentContextsFromEntry(entry)) {
      maybeCollectTweetSummary(context, tweetSummaries, tweetDedupeSet, conversationTweetIdSet);
      maybeCollectUserSummary(context, userSummaries, userDedupeSet);
      maybeCollectListSummary(context, listSummaries, listDedupeSet);
    }
  }

  for (const instruction of instructions) {
    if (!isAddToModuleInstruction(instruction)) {
      continue;
    }

    for (const context of collectItemContentContextsFromAddToModuleInstruction(instruction)) {
      maybeCollectTweetSummary(context, tweetSummaries, tweetDedupeSet, conversationTweetIdSet);
      maybeCollectUserSummary(context, userSummaries, userDedupeSet);
      maybeCollectListSummary(context, listSummaries, listDedupeSet);
    }
  }

  return {
    instructions,
    entries,
    tweets: tweetSummaries,
    users: userSummaries,
    lists: listSummaries,
    query: request.variables.rawQuery,
    product: request.variables.product,
    querySource: request.variables.querySource,
    cursorTop,
    cursorBottom,
    nextCursor: cursorBottom,
    prevCursor: cursorTop,
    hasMore: Boolean(cursorBottom),
    conversationTweetIds: Array.from(conversationTweetIdSet),
    errors: payload.errors,
    __original: payload
  };
}

function collectTimelineEntries(instructions: SearchTimelineInstruction[]): SearchTimelineEntry[] {
  const entries: SearchTimelineEntry[] = [];

  for (const instruction of instructions) {
    if (isAddEntriesInstruction(instruction)) {
      entries.push(...instruction.entries);
      continue;
    }

    if (isReplaceEntryInstruction(instruction) && instruction.entry) {
      entries.push(instruction.entry);
    }
  }

  return entries;
}

function isAddEntriesInstruction(
  instruction: SearchTimelineInstruction
): instruction is SearchTimelineAddEntriesInstruction {
  return instruction.type === 'TimelineAddEntries' && Array.isArray(instruction.entries);
}

function isAddToModuleInstruction(
  instruction: SearchTimelineInstruction
): instruction is SearchTimelineAddToModuleInstruction {
  return instruction.type === 'TimelineAddToModule' && Array.isArray(instruction.moduleItems);
}

function isReplaceEntryInstruction(
  instruction: SearchTimelineInstruction
): instruction is SearchTimelineReplaceEntryInstruction {
  return instruction.type === 'TimelineReplaceEntry';
}

function extractCursorValue(
  entry: SearchTimelineEntry
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

function collectConversationTweetIdsFromEntry(entry: SearchTimelineEntry, collector: Set<string>): void {
  const content = entry.content as {
    metadata?: {
      conversationMetadata?: {
        allTweetIds?: string[];
      };
    };
  };

  const allTweetIds = content.metadata?.conversationMetadata?.allTweetIds;
  if (!Array.isArray(allTweetIds)) {
    return;
  }

  for (const tweetId of allTweetIds) {
    if (tweetId) {
      collector.add(tweetId);
    }
  }
}

function collectItemContentContextsFromEntry(entry: SearchTimelineEntry): SearchTimelineItemContentContext[] {
  const contexts: SearchTimelineItemContentContext[] = [];

  const content = entry.content as {
    itemContent?: SearchTimelineTimelineItemContent;
    items?: SearchTimelineModuleItem[];
  };

  if (content.itemContent) {
    contexts.push({
      entryId: entry.entryId,
      sortIndex: entry.sortIndex,
      itemContent: content.itemContent
    });
  }

  if (!Array.isArray(content.items)) {
    return contexts;
  }

  for (const moduleItem of content.items) {
    const itemContent = moduleItem.item?.itemContent;
    if (!itemContent) {
      continue;
    }

    contexts.push({
      entryId: moduleItem.entryId,
      sortIndex: entry.sortIndex,
      itemContent
    });
  }

  return contexts;
}

function collectItemContentContextsFromAddToModuleInstruction(
  instruction: SearchTimelineAddToModuleInstruction
): SearchTimelineItemContentContext[] {
  const contexts: SearchTimelineItemContentContext[] = [];

  for (const moduleItem of instruction.moduleItems) {
    const itemContent = moduleItem.item?.itemContent;
    if (!itemContent) {
      continue;
    }

    contexts.push({
      entryId: moduleItem.entryId,
      itemContent
    });
  }

  return contexts;
}

function maybeCollectTweetSummary(
  context: SearchTimelineItemContentContext,
  collector: SearchTimelineTweetSummary[],
  dedupe: Set<string>,
  conversationTweetIdSet: Set<string>
): void {
  const tweet = unwrapTweetResult(context.itemContent.tweet_results?.result);
  if (!tweet) {
    return;
  }

  const summary = toTweetSummary(tweet, {
    entryId: context.entryId,
    sortIndex: context.sortIndex
  });

  const dedupeKey = summary.tweetId ? `tweet:${summary.tweetId}` : `entry:${summary.entryId}`;
  if (dedupe.has(dedupeKey)) {
    return;
  }

  dedupe.add(dedupeKey);
  collector.push(summary);

  if (summary.tweetId) {
    conversationTweetIdSet.add(summary.tweetId);
  }
}

function maybeCollectUserSummary(
  context: SearchTimelineItemContentContext,
  collector: SearchTimelineUserSummary[],
  dedupe: Set<string>
): void {
  const user = asSearchTimelineUser(context.itemContent.user_results?.result);
  if (!user) {
    return;
  }

  const summary = toUserSummary(user, {
    entryId: context.entryId,
    sortIndex: context.sortIndex
  });

  const dedupeKey = summary.userId ? `user:${summary.userId}` : `entry:${summary.entryId}`;
  if (dedupe.has(dedupeKey)) {
    return;
  }

  dedupe.add(dedupeKey);
  collector.push(summary);
}

function maybeCollectListSummary(
  context: SearchTimelineItemContentContext,
  collector: SearchTimelineListSummary[],
  dedupe: Set<string>
): void {
  const list = asSearchTimelineList(context.itemContent.list);
  if (!list) {
    return;
  }

  const summary = toListSummary(list, {
    entryId: context.entryId,
    sortIndex: context.sortIndex
  });

  const dedupeKey = summary.listId ? `list:${summary.listId}` : `entry:${summary.entryId}`;
  if (dedupe.has(dedupeKey)) {
    return;
  }

  dedupe.add(dedupeKey);
  collector.push(summary);
}

function unwrapTweetResult(result: SearchTimelineTweetResult | undefined): SearchTimelineTweet | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  if ('tombstone' in result) {
    return undefined;
  }

  if (isTweetWithVisibilityResult(result)) {
    return result.tweet;
  }

  const maybeTweet = result as SearchTimelineTweet;
  if (maybeTweet.__typename === 'Tweet' || maybeTweet.rest_id || maybeTweet.legacy || maybeTweet.core) {
    return maybeTweet;
  }

  return undefined;
}

function isTweetWithVisibilityResult(
  result: SearchTimelineTweetResult
): result is SearchTimelineTweetWithVisibilityResults {
  return result.__typename === 'TweetWithVisibilityResults' || 'tweet' in result;
}

function toTweetSummary(
  tweet: SearchTimelineTweet,
  context?: { entryId?: string; sortIndex?: string },
  depth = 0
): SearchTimelineTweetSummary {
  const user = asSearchTimelineUser(tweet.core?.user_results?.result);
  const userSummary = user ? toUserSummary(user) : undefined;

  let quotedTweet: SearchTimelineTweetSummary | undefined;
  const quotedResult = unwrapTweetResult(tweet.quoted_status_result?.result);
  if (quotedResult && depth < 1) {
    quotedTweet = toTweetSummary(quotedResult, undefined, depth + 1);
  } else if (tweet.legacy?.quoted_status_id_str) {
    quotedTweet = {
      tweetId: tweet.legacy.quoted_status_id_str
    };
  }

  return {
    entryId: context?.entryId,
    sortIndex: context?.sortIndex,
    tweetId: tweet.rest_id,
    conversationId: tweet.legacy?.conversation_id_str,
    fullText: tweet.legacy?.full_text,
    createdAt: tweet.legacy?.created_at,
    language: tweet.legacy?.lang,
    source: tweet.source,
    inReplyToTweetId: tweet.legacy?.in_reply_to_status_id_str,
    inReplyToUserId: tweet.legacy?.in_reply_to_user_id_str,
    inReplyToScreenName: tweet.legacy?.in_reply_to_screen_name,
    quotedTweet,
    user: userSummary,
    stats: {
      viewCount: tweet.views?.count,
      replyCount: tweet.legacy?.reply_count,
      retweetCount: tweet.legacy?.retweet_count,
      likeCount: tweet.legacy?.favorite_count,
      quoteCount: tweet.legacy?.quote_count,
      bookmarkCount: tweet.legacy?.bookmark_count
    },
    viewerState: {
      bookmarked: tweet.legacy?.bookmarked,
      favorited: tweet.legacy?.favorited,
      retweeted: tweet.legacy?.retweeted
    }
  };
}

function toUserSummary(
  user: SearchTimelineUser,
  context?: { entryId?: string; sortIndex?: string }
): SearchTimelineUserSummary {
  const relationship = {
    following: firstBoolean(user.relationship_perspectives?.following, user.legacy?.following),
    followedBy: firstBoolean(user.relationship_perspectives?.followed_by, user.legacy?.followed_by),
    blocking: firstBoolean(user.relationship_perspectives?.blocking, user.legacy?.blocking),
    blockedBy: firstBoolean(user.relationship_perspectives?.blocked_by, user.legacy?.blocked_by),
    muting: firstBoolean(user.relationship_perspectives?.muting, user.legacy?.muting),
    wantRetweets: firstBoolean(user.relationship_perspectives?.want_retweets, user.legacy?.want_retweets)
  };

  const relationshipSummary = hasAnyBooleanValue(relationship)
    ? {
      following: relationship.following,
      followedBy: relationship.followedBy,
      blocking: relationship.blocking,
      blockedBy: relationship.blockedBy,
      muting: relationship.muting,
      wantRetweets: relationship.wantRetweets
    }
    : undefined;

  return {
    entryId: context?.entryId,
    sortIndex: context?.sortIndex,
    userId: user.rest_id ?? user.id,
    name: user.core?.name ?? user.legacy?.name,
    screenName: user.core?.screen_name ?? user.legacy?.screen_name,
    description: user.legacy?.description,
    location: user.legacy?.location,
    profileImageUrl: user.avatar?.image_url ?? user.legacy?.profile_image_url_https,
    verified: user.verification?.verified ?? user.legacy?.verified,
    protected: user.privacy?.protected ?? user.legacy?.protected,
    followersCount: user.legacy?.followers_count,
    friendsCount: user.legacy?.friends_count,
    relationship: relationshipSummary
  };
}

function toListSummary(
  list: SearchTimelineList,
  context?: { entryId?: string; sortIndex?: string }
): SearchTimelineListSummary {
  const owner = asSearchTimelineUser(list.user_results?.result);

  return {
    entryId: context?.entryId,
    sortIndex: context?.sortIndex,
    listId: normalizeIdToString(list.id_str, list.id),
    name: list.name,
    description: list.description,
    mode: list.mode,
    following: list.following,
    isMember: list.is_member,
    muting: list.muting,
    memberCount: list.member_count,
    subscriberCount: list.subscriber_count,
    owner: owner ? toUserSummary(owner) : undefined
  };
}

function asSearchTimelineUser(value: unknown): SearchTimelineUser | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return value as SearchTimelineUser;
}

function asSearchTimelineList(value: unknown): SearchTimelineList | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return value as SearchTimelineList;
}

function normalizeIdToString(preferred?: string, fallback?: string | number): string | undefined {
  if (preferred) {
    return preferred;
  }

  if (typeof fallback === 'string' && fallback) {
    return fallback;
  }

  if (typeof fallback === 'number') {
    return String(fallback);
  }

  return undefined;
}

function firstBoolean(...values: Array<boolean | undefined>): boolean | undefined {
  for (const value of values) {
    if (typeof value === 'boolean') {
      return value;
    }
  }

  return undefined;
}

function hasAnyBooleanValue(value: {
  following?: boolean;
  followedBy?: boolean;
  blocking?: boolean;
  blockedBy?: boolean;
  muting?: boolean;
  wantRetweets?: boolean;
}): boolean {
  return Object.values(value).some((entry) => typeof entry === 'boolean');
}
