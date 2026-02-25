import type {
  UserTweetsAndRepliesAddEntriesInstruction,
  UserTweetsAndRepliesEntry,
  UserTweetsAndRepliesInstruction,
  UserTweetsAndRepliesOriginalResponse,
  UserTweetsAndRepliesResponse,
  UserTweetsAndRepliesTweet,
  UserTweetsAndRepliesTweetResult,
  UserTweetsAndRepliesTweetSummary,
  UserTweetsAndRepliesTweetWithVisibilityResults,
  UserTweetsAndRepliesUser
} from './types';

export function normalizeUserTweetsAndRepliesResponse(
  payload: UserTweetsAndRepliesOriginalResponse
): UserTweetsAndRepliesResponse {
  const instructions = payload.data?.user?.result?.timeline?.timeline?.instructions ?? [];
  const entries = collectTimelineEntries(instructions);
  const conversationTweetIdSet = new Set<string>();
  const tweetSummaries: UserTweetsAndRepliesTweetSummary[] = [];
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

function collectTimelineEntries(
  instructions: UserTweetsAndRepliesInstruction[]
): UserTweetsAndRepliesEntry[] {
  const entries: UserTweetsAndRepliesEntry[] = [];

  for (const instruction of instructions) {
    if (!isAddEntriesInstruction(instruction)) {
      continue;
    }
    entries.push(...instruction.entries);
  }

  return entries;
}

function isAddEntriesInstruction(
  instruction: UserTweetsAndRepliesInstruction
): instruction is UserTweetsAndRepliesAddEntriesInstruction {
  return instruction.type === 'TimelineAddEntries' && Array.isArray(instruction.entries);
}

function extractCursorValue(
  entry: UserTweetsAndRepliesEntry
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

function collectConversationTweetIdsFromEntry(
  entry: UserTweetsAndRepliesEntry,
  collector: Set<string>
): void {
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

function extractTweetSummariesFromEntry(
  entry: UserTweetsAndRepliesEntry
): UserTweetsAndRepliesTweetSummary[] {
  const summaries: UserTweetsAndRepliesTweetSummary[] = [];
  const content = entry.content as {
    itemContent?: {
      tweet_results?: {
        result?: UserTweetsAndRepliesTweetResult;
      };
    };
    items?: Array<{
      entryId: string;
      item?: {
        itemContent?: {
          tweet_results?: {
            result?: UserTweetsAndRepliesTweetResult;
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

function unwrapTweetResult(
  result: UserTweetsAndRepliesTweetResult | undefined
): UserTweetsAndRepliesTweet | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  if ('tombstone' in result) {
    return undefined;
  }

  if (isTweetWithVisibilityResult(result)) {
    return result.tweet;
  }

  const maybeTweet = result as UserTweetsAndRepliesTweet;
  if (maybeTweet.__typename === 'Tweet' || maybeTweet.rest_id || maybeTweet.legacy || maybeTweet.core) {
    return maybeTweet;
  }

  return undefined;
}

function isTweetWithVisibilityResult(
  result: UserTweetsAndRepliesTweetResult
): result is UserTweetsAndRepliesTweetWithVisibilityResults {
  return result.__typename === 'TweetWithVisibilityResults' || 'tweet' in result;
}

function buildTweetSummary(
  entryId: string,
  sortIndex: string | undefined,
  tweet: UserTweetsAndRepliesTweet
): UserTweetsAndRepliesTweetSummary {
  const user = asUserTweetsAndRepliesUser(tweet.core?.user_results?.result);
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

function asUserTweetsAndRepliesUser(value: unknown): UserTweetsAndRepliesUser | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return value as UserTweetsAndRepliesUser;
}
