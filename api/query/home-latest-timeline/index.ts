import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildHomeLatestTimelineRequest } from './default';
import type {
  HomeLatestTimelineAddEntriesInstruction,
  HomeLatestTimelineEntry,
  HomeLatestTimelineInstruction,
  HomeLatestTimelineOriginalResponse,
  HomeLatestTimelineRequest,
  HomeLatestTimelineResponse,
  HomeLatestTimelineTweet,
  HomeLatestTimelineTweetResult,
  HomeLatestTimelineTweetSummary
} from './types';

const HOME_LATEST_TIMELINE_DOC = `# home-latest-timeline

Fetch latest home timeline entries via Twitter/X GraphQL.

Request type: HomeLatestTimelineRequest
Response type: HomeLatestTimelineResponse

Input strategy:
- Provide only the fields you care about (for example: cursor).
- Remaining variables/features come from default.ts.
- You can override any default through variablesOverride/featuresOverride.

Normalized response fields:
- instructions / entries: flattened timeline branches
- tweets: extracted high-frequency tweet summaries
- nextCursor / prevCursor: standardized pagination cursors
- cursorTop / cursorBottom: compatibility cursor aliases
- __original: full GraphQL payload`;

const homeLatestTimelineDesc: XApiDesc = {
  id: 'home-latest-timeline',
  title: 'Home Latest Timeline',
  doc: HOME_LATEST_TIMELINE_DOC,
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/HomeLatestTimeline',
    operationName: 'HomeLatestTimeline'
  },
  requestTypeName: 'HomeLatestTimelineRequest',
  responseTypeName: 'HomeLatestTimelineResponse',
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

async function homeLatestTimelineImpl(
  input: HomeLatestTimelineRequest = {}
): Promise<HomeLatestTimelineResponse> {
  const resolved = buildHomeLatestTimelineRequest(input);

  const response = await fetch(resolved.endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: buildGraphqlHeaders(resolved.headers),
    body: JSON.stringify({
      operationName: resolved.operationName,
      queryId: resolved.queryId,
      variables: resolved.variables,
      features: resolved.features
    })
  });

  const responseText = await response.text();
  let payload: HomeLatestTimelineOriginalResponse;

  try {
    payload = JSON.parse(responseText) as HomeLatestTimelineOriginalResponse;
  } catch {
    throw new Error(
      `home-latest-timeline returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`home-latest-timeline failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`home-latest-timeline failed with status ${response.status}`);
  }

  return normalizeHomeLatestTimelineResponse(payload);
}

function normalizeHomeLatestTimelineResponse(
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
      profileImageUrl: user.avatar?.image_url,
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
    viewCount: tweet.views?.count,
    user: userSummary,
    stats: {
      replyCount: tweet.legacy?.reply_count,
      retweetCount: tweet.legacy?.retweet_count,
      likeCount: tweet.legacy?.favorite_count,
      quoteCount: tweet.legacy?.quote_count,
      bookmarkCount: tweet.legacy?.bookmark_count
    }
  };
}

export const homeLatestTimeline = Object.assign(homeLatestTimelineImpl, {
  __desc: homeLatestTimelineDesc
}) as XCallableApi<HomeLatestTimelineRequest, HomeLatestTimelineResponse>;

export * from './default';
export * from './types';
