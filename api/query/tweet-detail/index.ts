import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildTweetDetailRequest } from './default';
import type {
  TweetDetailAddEntriesInstruction,
  TweetDetailEntry,
  TweetDetailInstruction,
  TweetDetailOriginalResponse,
  TweetDetailRequest,
  TweetDetailResolvedRequest,
  TweetDetailResponse,
  TweetDetailTweet,
  TweetDetailTweetResult,
  TweetDetailTweetSummary,
  TweetDetailTweetWithVisibilityResults,
  TweetDetailUser
} from './types';

const TWEET_DETAIL_DOC = `# tweet-detail

Fetch detail thread (main tweet, conversation branches, related tweets) via Twitter/X GraphQL.

Request type: TweetDetailRequest
Response type: TweetDetailResponse

Input strategy:
- Required: detailId (tweet id)
- Defaults are stored in default.ts.
- Protocol-level customization is available through variablesOverride/featuresOverride/fieldTogglesOverride.

Normalized response fields:
- instructions / entries: flattened timeline branches
- tweets: extracted high-frequency tweet summaries
- focalTweet: matched by detailId when available
- cursorTop / cursorBottom: pagination cursors
- __original: full GraphQL payload`;

const tweetDetailDesc: XApiDesc = {
  id: 'tweet-detail',
  title: 'Tweet Detail',
  doc: TWEET_DETAIL_DOC,
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/TweetDetail',
    operationName: 'TweetDetail'
  },
  requestTypeName: 'TweetDetailRequest',
  responseTypeName: 'TweetDetailResponse'
};

async function tweetDetailImpl(input: TweetDetailRequest): Promise<TweetDetailResponse> {
  const resolved = buildTweetDetailRequest(input);
  const requestUrl = buildTweetDetailUrl(resolved);

  const response = await fetch(requestUrl, {
    method: 'GET',
    credentials: 'include',
    headers: buildGraphqlHeaders(resolved.headers)
  });

  const responseText = await response.text();
  let payload: TweetDetailOriginalResponse;

  try {
    payload = JSON.parse(responseText) as TweetDetailOriginalResponse;
  } catch {
    throw new Error(
      `tweet-detail returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`tweet-detail failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`tweet-detail failed with status ${response.status}`);
  }

  return normalizeTweetDetailResponse(payload, resolved.variables.focalTweetId);
}

function buildTweetDetailUrl(request: TweetDetailResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));
  params.set('fieldToggles', JSON.stringify(request.fieldToggles));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}

function normalizeTweetDetailResponse(
  payload: TweetDetailOriginalResponse,
  focalTweetId: string
): TweetDetailResponse {
  const instructions = payload.data?.threaded_conversation_with_injections_v2?.instructions ?? [];
  const entries = collectTimelineEntries(instructions);
  const conversationTweetIdSet = new Set<string>();
  const tweetSummaries: TweetDetailTweetSummary[] = [];
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

  const focalTweet = tweetSummaries.find((item) => item.tweetId === focalTweetId);

  return {
    instructions,
    entries,
    tweets: tweetSummaries,
    focalTweet,
    cursorTop,
    cursorBottom,
    conversationTweetIds: Array.from(conversationTweetIdSet),
    errors: payload.errors,
    __original: payload
  };
}

function collectTimelineEntries(instructions: TweetDetailInstruction[]): TweetDetailEntry[] {
  const entries: TweetDetailEntry[] = [];

  for (const instruction of instructions) {
    if (!isAddEntriesInstruction(instruction)) {
      continue;
    }
    entries.push(...instruction.entries);
  }

  return entries;
}

function isAddEntriesInstruction(
  instruction: TweetDetailInstruction
): instruction is TweetDetailAddEntriesInstruction {
  return instruction.type === 'TimelineAddEntries' && Array.isArray(instruction.entries);
}

function extractCursorValue(
  entry: TweetDetailEntry
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

function collectConversationTweetIdsFromEntry(entry: TweetDetailEntry, collector: Set<string>): void {
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

function extractTweetSummariesFromEntry(entry: TweetDetailEntry): TweetDetailTweetSummary[] {
  const summaries: TweetDetailTweetSummary[] = [];
  const content = entry.content as {
    itemContent?: {
      tweet_results?: {
        result?: TweetDetailTweetResult;
      };
    };
    items?: Array<{
      entryId: string;
      item?: {
        itemContent?: {
          tweet_results?: {
            result?: TweetDetailTweetResult;
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

function unwrapTweetResult(result: TweetDetailTweetResult | undefined): TweetDetailTweet | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  if ('tombstone' in result) {
    return undefined;
  }

  if (isTweetWithVisibilityResult(result)) {
    return result.tweet;
  }

  const maybeTweet = result as TweetDetailTweet;
  if (maybeTweet.__typename === 'Tweet' || maybeTweet.rest_id || maybeTweet.legacy || maybeTweet.core) {
    return maybeTweet;
  }

  return undefined;
}

function isTweetWithVisibilityResult(
  result: TweetDetailTweetResult
): result is TweetDetailTweetWithVisibilityResults {
  return result.__typename === 'TweetWithVisibilityResults' || 'tweet' in result;
}

function buildTweetSummary(
  entryId: string,
  sortIndex: string | undefined,
  tweet: TweetDetailTweet
): TweetDetailTweetSummary {
  const user = asTweetDetailUser(tweet.core?.user_results?.result);
  const userSummary = user
    ? {
        userId: user.rest_id ?? user.id,
        name: user.core?.name,
        screenName: user.core?.screen_name,
        verified: user.verification?.verified ?? user.legacy?.verified,
        profileImageUrl: user.legacy?.profile_image_url_https ?? user.avatar?.image_url
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

function asTweetDetailUser(value: unknown): TweetDetailUser | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const maybeUser = value as Partial<TweetDetailUser> & { __typename?: string };
  if (
    maybeUser.__typename === 'User' ||
    typeof maybeUser.rest_id === 'string' ||
    typeof maybeUser.id === 'string' ||
    typeof maybeUser.core === 'object'
  ) {
    return maybeUser as TweetDetailUser;
  }

  return undefined;
}

export const tweetDetail = Object.assign(tweetDetailImpl, {
  __desc: tweetDetailDesc
}) as XCallableApi<TweetDetailRequest, TweetDetailResponse>;

export * from './default';
export * from './types';
