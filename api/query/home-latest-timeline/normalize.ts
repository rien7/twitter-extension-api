import type {
  HomeLatestTimelineAddEntriesInstruction,
  HomeLatestTimelineEntry,
  HomeLatestTimelineInstruction,
  HomeLatestTimelineOriginalResponse,
  HomeLatestTimelineResponse,
  HomeLatestTimelineTweet,
  HomeLatestTimelineTweetResult,
  HomeLatestTimelineTweetSummary
} from './types';

export function normalizeHomeLatestTimelineResponse(
  payload: HomeLatestTimelineOriginalResponse
): HomeLatestTimelineResponse {
  const instructions = payload.data?.home?.home_timeline_urt?.instructions ?? [];
  const entries = collectTimelineEntries(instructions);
  const tweets: HomeLatestTimelineTweetSummary[] = [];

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

    const tweet = extractTweet(entry);
    if (!tweet) {
      continue;
    }

    tweets.push(buildTweetSummary(entry, tweet));
  }

  return {
    instructions,
    entries,
    tweets,
    cursorTop,
    cursorBottom,
    nextCursor: cursorBottom,
    prevCursor: cursorTop,
    hasMore: Boolean(cursorBottom),
    scribePage: payload.data?.home?.home_timeline_urt?.metadata?.scribeConfig?.page,
    errors: payload.errors,
    __original: payload
  };
}

function collectTimelineEntries(instructions: HomeLatestTimelineInstruction[]): HomeLatestTimelineEntry[] {
  const entries: HomeLatestTimelineEntry[] = [];

  for (const instruction of instructions) {
    if (!isAddEntriesInstruction(instruction)) {
      continue;
    }
    entries.push(...instruction.entries);
  }

  return entries;
}

function isAddEntriesInstruction(
  instruction: HomeLatestTimelineInstruction
): instruction is HomeLatestTimelineAddEntriesInstruction {
  return instruction.type === 'TimelineAddEntries' && Array.isArray(instruction.entries);
}

function extractCursorValue(
  entry: HomeLatestTimelineEntry
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

function extractTweet(entry: HomeLatestTimelineEntry): HomeLatestTimelineTweet | undefined {
  const content = entry.content as {
    itemContent?: {
      tweet_results?: {
        result?: HomeLatestTimelineTweetResult;
      };
    };
  };

  return unwrapTweetResult(content.itemContent?.tweet_results?.result);
}

function unwrapTweetResult(result: HomeLatestTimelineTweetResult | undefined): HomeLatestTimelineTweet | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  if ('tombstone' in result) {
    return undefined;
  }

  const maybeTweet = result as HomeLatestTimelineTweet;
  if (maybeTweet.__typename === 'Tweet' || maybeTweet.rest_id || maybeTweet.legacy || maybeTweet.core) {
    return maybeTweet;
  }

  return undefined;
}

function buildTweetSummary(
  entry: HomeLatestTimelineEntry,
  tweet: HomeLatestTimelineTweet
): HomeLatestTimelineTweetSummary {
  const user = tweet.core?.user_results?.result;
  const userSummary = user
    ? {
      userId: user.rest_id ?? user.id,
      name: user.core?.name,
      screenName: user.core?.screen_name,
      verified: user.verification?.verified ?? user.legacy?.verified,
      profileImageUrl: user.avatar?.image_url
    }
    : undefined;

  return {
    entryId: entry.entryId,
    sortIndex: entry.sortIndex,
    tweetId: tweet.rest_id,
    fullText: tweet.legacy?.full_text,
    createdAt: tweet.legacy?.created_at,
    language: tweet.legacy?.lang,
    source: tweet.source,
    user: userSummary,
    stats: {
      viewCount: tweet.views?.count,
      replyCount: tweet.legacy?.reply_count,
      retweetCount: tweet.legacy?.retweet_count,
      likeCount: tweet.legacy?.favorite_count,
      quoteCount: tweet.legacy?.quote_count,
      bookmarkCount: tweet.legacy?.bookmark_count
    }
  };
}
