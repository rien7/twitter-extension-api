import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildUserTweetsRequest } from './default';
import type {
  UserTweetsAddEntriesInstruction,
  UserTweetsEntry,
  UserTweetsInstruction,
  UserTweetsOriginalResponse,
  UserTweetsRequest,
  UserTweetsResolvedRequest,
  UserTweetsResponse,
  UserTweetsTweet,
  UserTweetsTweetResult,
  UserTweetsTweetSummary,
  UserTweetsTweetWithVisibilityResults,
  UserTweetsUser
} from './types';

const USER_TWEETS_DOC = `# user-tweets

Fetch a user's tweets timeline via Twitter/X GraphQL.

Request type: UserTweetsRequest
Response type: UserTweetsResponse

Input strategy:
- userId is optional; defaults to self userId from twid cookie.
- Defaults are stored in default.ts.
- Protocol-level customization is available via variablesOverride/featuresOverride/fieldTogglesOverride.

Normalized response fields:
- instructions / entries: flattened timeline branches
- tweets: extracted high-frequency tweet summaries
- nextCursor / prevCursor: standardized pagination cursors
- cursorTop / cursorBottom: compatibility cursor aliases
- conversationTweetIds: aggregated from timeline metadata and tweets
- __original: full GraphQL payload`;

const userTweetsDesc: XApiDesc = {
  id: 'user-tweets',
  title: 'User Tweets Timeline',
  doc: USER_TWEETS_DOC,
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/UserTweets',
    operationName: 'UserTweets'
  },
  requestTypeName: 'UserTweetsRequest',
  responseTypeName: 'UserTweetsResponse',
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

async function userTweetsImpl(input: UserTweetsRequest = {}): Promise<UserTweetsResponse> {
  const resolved = buildUserTweetsRequest(input);
  const requestUrl = buildUserTweetsUrl(resolved);

  const response = await fetch(requestUrl, {
    method: 'GET',
    credentials: 'include',
    headers: buildGraphqlHeaders(resolved.headers)
  });

  const responseText = await response.text();
  let payload: UserTweetsOriginalResponse;

  try {
    payload = JSON.parse(responseText) as UserTweetsOriginalResponse;
  } catch {
    throw new Error(
      `user-tweets returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`user-tweets failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`user-tweets failed with status ${response.status}`);
  }

  return normalizeUserTweetsResponse(payload);
}

function buildUserTweetsUrl(request: UserTweetsResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));
  params.set('fieldToggles', JSON.stringify(request.fieldToggles));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}

function normalizeUserTweetsResponse(payload: UserTweetsOriginalResponse): UserTweetsResponse {
  const instructions = payload.data?.user?.result?.timeline?.timeline?.instructions ?? [];
  const entries = collectTimelineEntries(instructions);
  const conversationTweetIdSet = new Set<string>();
  const tweetSummaries: UserTweetsTweetSummary[] = [];
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

function collectTimelineEntries(instructions: UserTweetsInstruction[]): UserTweetsEntry[] {
  const entries: UserTweetsEntry[] = [];

  for (const instruction of instructions) {
    if (!isAddEntriesInstruction(instruction)) {
      continue;
    }
    entries.push(...instruction.entries);
  }

  return entries;
}

function isAddEntriesInstruction(
  instruction: UserTweetsInstruction
): instruction is UserTweetsAddEntriesInstruction {
  return instruction.type === 'TimelineAddEntries' && Array.isArray(instruction.entries);
}

function extractCursorValue(
  entry: UserTweetsEntry
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

function collectConversationTweetIdsFromEntry(entry: UserTweetsEntry, collector: Set<string>): void {
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

function extractTweetSummariesFromEntry(entry: UserTweetsEntry): UserTweetsTweetSummary[] {
  const summaries: UserTweetsTweetSummary[] = [];
  const content = entry.content as {
    itemContent?: {
      tweet_results?: {
        result?: UserTweetsTweetResult;
      };
    };
    items?: Array<{
      entryId: string;
      item?: {
        itemContent?: {
          tweet_results?: {
            result?: UserTweetsTweetResult;
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

function unwrapTweetResult(result: UserTweetsTweetResult | undefined): UserTweetsTweet | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  if ('tombstone' in result) {
    return undefined;
  }

  if (isTweetWithVisibilityResult(result)) {
    return result.tweet;
  }

  const maybeTweet = result as UserTweetsTweet;
  if (maybeTweet.__typename === 'Tweet' || maybeTweet.rest_id || maybeTweet.legacy || maybeTweet.core) {
    return maybeTweet;
  }

  return undefined;
}

function isTweetWithVisibilityResult(
  result: UserTweetsTweetResult
): result is UserTweetsTweetWithVisibilityResults {
  return result.__typename === 'TweetWithVisibilityResults' || 'tweet' in result;
}

function buildTweetSummary(
  entryId: string,
  sortIndex: string | undefined,
  tweet: UserTweetsTweet
): UserTweetsTweetSummary {
  const user = asUserTweetsUser(tweet.core?.user_results?.result);
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

function asUserTweetsUser(value: unknown): UserTweetsUser | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return value as UserTweetsUser;
}

export const userTweets = Object.assign(userTweetsImpl, {
  __desc: userTweetsDesc
}) as XCallableApi<UserTweetsRequest, UserTweetsResponse>;

export * from './default';
export * from './types';
