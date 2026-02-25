import type {
  NotificationsTimelineAddEntriesInstruction,
  NotificationsTimelineEntry,
  NotificationsTimelineInstruction,
  NotificationsTimelineNotificationItemContent,
  NotificationsTimelineNotificationSummary,
  NotificationsTimelineNotificationTargetObject,
  NotificationsTimelineOriginalResponse,
  NotificationsTimelineResponse,
  NotificationsTimelineRichMessage,
  NotificationsTimelineTweet,
  NotificationsTimelineTweetItemContent,
  NotificationsTimelineTweetResult,
  NotificationsTimelineTweetSummary,
  NotificationsTimelineTweetWithVisibilityResults,
  NotificationsTimelineUser,
  NotificationsTimelineUserResult,
  NotificationsTimelineUserSummary
} from './types';

export function normalizeNotificationsTimelineResponse(
  payload: NotificationsTimelineOriginalResponse
): NotificationsTimelineResponse {
  const viewerResult = payload.data?.viewer_v2?.user_results?.result;
  const timelineBranch = viewerResult?.notification_timeline;
  const instructions = timelineBranch?.timeline?.instructions ?? [];
  const entries = collectTimelineEntries(instructions);
  const notifications: NotificationsTimelineNotificationSummary[] = [];
  const tweets: NotificationsTimelineTweetSummary[] = [];
  const seenNotifications = new Set<string>();
  const seenTweets = new Set<string>();

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

    const notification = extractNotificationSummary(entry);
    if (notification) {
      const dedupeKey = notification.notificationId
        ? `notification:${notification.notificationId}`
        : `entry:${notification.entryId}`;
      if (!seenNotifications.has(dedupeKey)) {
        seenNotifications.add(dedupeKey);
        notifications.push(notification);
      }
    }

    const tweet = extractTweetSummary(entry);
    if (tweet) {
      const dedupeKey = tweet.tweetId ? `tweet:${tweet.tweetId}` : `entry:${tweet.entryId}`;
      if (!seenTweets.has(dedupeKey)) {
        seenTweets.add(dedupeKey);
        tweets.push(tweet);
      }
    }
  }

  return {
    timelineId: timelineBranch?.id,
    viewerUserId: viewerResult?.rest_id,
    instructions,
    entries,
    notifications,
    tweets,
    cursorTop,
    cursorBottom,
    nextCursor: cursorBottom,
    prevCursor: cursorTop,
    hasMore: Boolean(cursorBottom),
    unreadMarkerSortIndex: findUnreadMarkerSortIndex(instructions),
    clearedUnreadState: hasClearUnreadState(instructions),
    errors: payload.errors,
    __original: payload
  };
}

function collectTimelineEntries(instructions: NotificationsTimelineInstruction[]): NotificationsTimelineEntry[] {
  const entries: NotificationsTimelineEntry[] = [];

  for (const instruction of instructions) {
    if (!isAddEntriesInstruction(instruction)) {
      continue;
    }
    entries.push(...instruction.entries);
  }

  return entries;
}

function isAddEntriesInstruction(
  instruction: NotificationsTimelineInstruction
): instruction is NotificationsTimelineAddEntriesInstruction {
  return instruction.type === 'TimelineAddEntries' && Array.isArray(instruction.entries);
}

function extractCursorValue(
  entry: NotificationsTimelineEntry
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

function extractNotificationSummary(
  entry: NotificationsTimelineEntry
): NotificationsTimelineNotificationSummary | undefined {
  const content = entry.content as {
    itemContent?: unknown;
  };

  const item = asNotificationItemContent(content.itemContent);
  if (!item) {
    return undefined;
  }

  const fromUsers = extractFromUsers(item);
  const targetTweetIds = extractTargetTweetIds(item.template?.target_objects, item.rich_message);

  return {
    entryId: entry.entryId,
    sortIndex: entry.sortIndex,
    notificationId: item.id,
    icon: item.notification_icon,
    timestampMs: item.timestamp_ms,
    messageText: item.rich_message?.text,
    url: item.notification_url?.url,
    urlType: item.notification_url?.urlType,
    templateType: item.template?.__typename,
    fromUsers,
    targetTweetIds
  };
}

function asNotificationItemContent(value: unknown): NotificationsTimelineNotificationItemContent | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const item = value as NotificationsTimelineNotificationItemContent;
  if (item.itemType === 'TimelineNotification' || item.__typename === 'TimelineNotification') {
    return item;
  }

  return undefined;
}

function extractFromUsers(item: NotificationsTimelineNotificationItemContent): NotificationsTimelineUserSummary[] {
  const output: NotificationsTimelineUserSummary[] = [];
  const dedupe = new Set<string>();

  for (const userRef of item.template?.from_users ?? []) {
    const user = asTimelineUser(userRef.user_results?.result);
    if (!user) {
      continue;
    }

    const summary = toUserSummary(user);
    const dedupeKey = summary.userId ? `user:${summary.userId}` : `name:${summary.name ?? ''}`;
    if (dedupe.has(dedupeKey)) {
      continue;
    }

    dedupe.add(dedupeKey);
    output.push(summary);
  }

  return output;
}

function extractTargetTweetIds(
  targetObjects: NotificationsTimelineNotificationTargetObject[] | undefined,
  richMessage: NotificationsTimelineRichMessage | undefined
): string[] {
  const collector = new Set<string>();

  for (const targetObject of targetObjects ?? []) {
    const tweet = unwrapTweetResult(targetObject.tweet_results?.result);
    if (tweet?.rest_id) {
      collector.add(tweet.rest_id);
    }
  }

  for (const entity of richMessage?.entities ?? []) {
    const tweet = unwrapTweetResult(entity.ref?.tweet_results?.result);
    if (tweet?.rest_id) {
      collector.add(tweet.rest_id);
    }
  }

  return Array.from(collector);
}

function extractTweetSummary(entry: NotificationsTimelineEntry): NotificationsTimelineTweetSummary | undefined {
  const content = entry.content as {
    itemContent?: unknown;
  };

  const item = asTweetItemContent(content.itemContent);
  if (!item) {
    return undefined;
  }

  const tweet = unwrapTweetResult(item.tweet_results?.result);
  if (!tweet) {
    return undefined;
  }

  const user = asTimelineUser(tweet.core?.user_results?.result);

  return {
    entryId: entry.entryId,
    sortIndex: entry.sortIndex,
    tweetId: tweet.rest_id,
    fullText: tweet.legacy?.full_text,
    createdAt: tweet.legacy?.created_at,
    language: tweet.legacy?.lang,
    source: tweet.source,
    conversationId: tweet.legacy?.conversation_id_str,
    inReplyToTweetId: tweet.legacy?.in_reply_to_status_id_str,
    inReplyToUserId: tweet.legacy?.in_reply_to_user_id_str,
    user: user ? toUserSummary(user) : undefined,
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

function asTweetItemContent(value: unknown): NotificationsTimelineTweetItemContent | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const item = value as NotificationsTimelineTweetItemContent;
  if (item.itemType === 'TimelineTweet' || item.__typename === 'TimelineTweet') {
    return item;
  }

  return undefined;
}

function unwrapTweetResult(result: NotificationsTimelineTweetResult | undefined): NotificationsTimelineTweet | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  if ('tombstone' in result) {
    return undefined;
  }

  if (isTweetWithVisibilityResult(result)) {
    return result.tweet;
  }

  const maybeTweet = result as NotificationsTimelineTweet;
  if (maybeTweet.__typename === 'Tweet' || maybeTweet.rest_id || maybeTweet.legacy || maybeTweet.core) {
    return maybeTweet;
  }

  return undefined;
}

function isTweetWithVisibilityResult(
  result: NotificationsTimelineTweetResult
): result is NotificationsTimelineTweetWithVisibilityResults {
  return result.__typename === 'TweetWithVisibilityResults' || 'tweet' in result;
}

function asTimelineUser(result: NotificationsTimelineUserResult | undefined): NotificationsTimelineUser | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  const maybeUser = result as NotificationsTimelineUser;
  if (maybeUser.__typename === 'User' || maybeUser.rest_id || maybeUser.core || maybeUser.legacy) {
    return maybeUser;
  }

  return undefined;
}

function toUserSummary(user: NotificationsTimelineUser): NotificationsTimelineUserSummary {
  return {
    userId: user.rest_id ?? user.id,
    name: user.core?.name ?? user.legacy?.name,
    screenName: user.core?.screen_name ?? user.legacy?.screen_name,
    verified: user.verification?.verified ?? user.legacy?.verified,
    profileImageUrl: user.avatar?.image_url ?? user.legacy?.profile_image_url_https
  };
}

function findUnreadMarkerSortIndex(instructions: NotificationsTimelineInstruction[]): string | undefined {
  for (const instruction of instructions) {
    if (instruction.type !== 'TimelineMarkEntriesUnreadGreaterThanSortIndex') {
      continue;
    }

    if (typeof instruction.sort_index === 'string' && instruction.sort_index) {
      return instruction.sort_index;
    }
  }

  return undefined;
}

function hasClearUnreadState(instructions: NotificationsTimelineInstruction[]): boolean {
  return instructions.some((instruction) => instruction.type === 'TimelineClearEntriesUnreadState');
}
