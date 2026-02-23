import type {
  BookmarksAddEntriesInstruction,
  BookmarksEntry,
  BookmarksInstruction,
  BookmarksOriginalResponse,
  BookmarksResponse,
  BookmarksTweet,
  BookmarksTweetResult,
  BookmarksTweetSummary,
  BookmarksTweetWithVisibilityResults,
  BookmarksUser
} from './types';

export function normalizeBookmarksResponse(payload: BookmarksOriginalResponse): BookmarksResponse {
  const instructions = payload.data?.bookmark_timeline_v2?.timeline?.instructions ?? [];
  const entries = collectTimelineEntries(instructions);
  const conversationTweetIdSet = new Set<string>();
  const tweetSummaries: BookmarksTweetSummary[] = [];
  const dedupeSet = new Set<string>();

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

    for (const summary of extractTweetSummariesFromEntry(entry)) {
      const dedupeKey = summary.tweetId ? `tweet:${summary.tweetId}` : `entry:${summary.entryId}`;
      if (dedupeSet.has(dedupeKey)) {
        continue;
      }
      dedupeSet.add(dedupeKey);
      tweetSummaries.push(summary);
      if (summary.tweetId) {
        conversationTweetIdSet.add(summary.tweetId);
      }
    }
  }

  return {
    instructions,
    entries,
    tweets: tweetSummaries,
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

function collectTimelineEntries(instructions: BookmarksInstruction[]): BookmarksEntry[] {
  const entries: BookmarksEntry[] = [];

  for (const instruction of instructions) {
    if (!isAddEntriesInstruction(instruction)) {
      continue;
    }
    entries.push(...instruction.entries);
  }

  return entries;
}

function isAddEntriesInstruction(
  instruction: BookmarksInstruction
): instruction is BookmarksAddEntriesInstruction {
  return instruction.type === 'TimelineAddEntries' && Array.isArray(instruction.entries);
}

function extractCursorValue(entry: BookmarksEntry): { type: 'top' | 'bottom'; value: string } | undefined {
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

function collectConversationTweetIdsFromEntry(entry: BookmarksEntry, collector: Set<string>): void {
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

function extractTweetSummariesFromEntry(entry: BookmarksEntry): BookmarksTweetSummary[] {
  const summaries: BookmarksTweetSummary[] = [];
  const content = entry.content as {
    itemContent?: {
      tweet_results?: {
        result?: BookmarksTweetResult;
      };
    };
    items?: Array<{
      entryId: string;
      item?: {
        itemContent?: {
          tweet_results?: {
            result?: BookmarksTweetResult;
          };
        };
      };
    }>;
  };

  const singleItemTweet = unwrapTweetResult(content.itemContent?.tweet_results?.result);
  if (singleItemTweet) {
    summaries.push(buildTweetSummary(entry.entryId, entry.sortIndex, singleItemTweet));
  }

  if (!Array.isArray(content.items)) {
    return summaries;
  }

  for (const moduleItem of content.items) {
    const moduleTweet = unwrapTweetResult(moduleItem.item?.itemContent?.tweet_results?.result);
    if (!moduleTweet) {
      continue;
    }
    summaries.push(buildTweetSummary(moduleItem.entryId, entry.sortIndex, moduleTweet));
  }

  return summaries;
}

function unwrapTweetResult(result: BookmarksTweetResult | undefined): BookmarksTweet | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  if ('tombstone' in result) {
    return undefined;
  }

  if (isTweetWithVisibilityResult(result)) {
    return result.tweet;
  }

  const maybeTweet = result as BookmarksTweet;
  if (maybeTweet.__typename === 'Tweet' || maybeTweet.rest_id || maybeTweet.legacy || maybeTweet.core) {
    return maybeTweet;
  }

  return undefined;
}

function isTweetWithVisibilityResult(
  result: BookmarksTweetResult
): result is BookmarksTweetWithVisibilityResults {
  return result.__typename === 'TweetWithVisibilityResults' || 'tweet' in result;
}

function buildTweetSummary(
  entryId: string,
  sortIndex: string | undefined,
  tweet: BookmarksTweet
): BookmarksTweetSummary {
  const user = asBookmarksUser(tweet.core?.user_results?.result);
  const userSummary = user
    ? {
      userId: user.rest_id ?? user.id,
      name: user.core?.name ?? user.legacy?.name,
      screenName: user.core?.screen_name ?? user.legacy?.screen_name,
      verified: user.verification?.verified ?? user.legacy?.verified,
      profileImageUrl: user.avatar?.image_url ?? user.legacy?.profile_image_url_https
    }
    : undefined;

  return {
    entryId,
    sortIndex,
    tweetId: tweet.rest_id,
    fullText: tweet.legacy?.full_text,
    createdAt: tweet.legacy?.created_at,
    language: tweet.legacy?.lang,
    source: tweet.source,
    conversationId: tweet.legacy?.conversation_id_str,
    inReplyToTweetId: tweet.legacy?.in_reply_to_status_id_str,
    inReplyToUserId: tweet.legacy?.in_reply_to_user_id_str,
    viewCount: tweet.views?.count,
    user: userSummary,
    stats: {
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

function asBookmarksUser(value: unknown): BookmarksUser | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return value as BookmarksUser;
}
