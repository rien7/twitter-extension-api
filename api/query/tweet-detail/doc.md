# tweet-detail

## Purpose
Fetch a tweet detail thread from Twitter/X GraphQL, including:
- focal tweet,
- conversation/replies timeline instructions,
- cursor/module entries,
- related tweet modules.

Use this API when an extension needs to render or inspect one tweet's full context.

## Endpoint
- Method: `GET`
- Path pattern: `/i/api/graphql/*/TweetDetail`
- OperationName: `TweetDetail`

## Parameter Strategy

This module follows the `action-minimal-input` pattern:
- Required business field: `detailId`.
- Protocol-heavy defaults (queryId/variables/features/fieldToggles) live in `default.ts`.
- Any default can still be overridden by `variablesOverride`, `featuresOverride`, `fieldTogglesOverride`.

## Request Type
Type name: `TweetDetailRequest`

### Core fields
- `detailId`: Required target tweet id. Mapped to `variables.focalTweetId`.
- `variablesOverride`: Partial override of default GraphQL variables.
- `featuresOverride`: Partial override of feature flags.
- `fieldTogglesOverride`: Partial override of field toggles.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.

### Default behavior
`buildTweetDetailRequest(input)` merges values in this order:
1. defaults from `default.ts`,
2. override objects,
3. explicit `detailId` mapped to `variables.focalTweetId`.

That means `detailId` always wins over `variablesOverride.focalTweetId`.

## Response Type
Type name: `TweetDetailResponse`

### Normalized top-level fields
- `instructions`: Raw instruction array (lifted from GraphQL payload).
- `entries`: Flattened entries from `TimelineAddEntries`.
- `tweets`: Frequently-used tweet summaries (id/text/author/stats/viewer-state).
- `focalTweet`: Summary matching `detailId` when found.
- `cursorTop`: Top cursor value if present.
- `cursorBottom`: Bottom cursor value if present.
- `nextCursor`: Standardized next-page cursor (same value as `cursorBottom`).
- `prevCursor`: Standardized previous-page cursor (same value as `cursorTop`).
- `hasMore`: Whether next-page cursor exists.
- `conversationTweetIds`: Conversation-level tweet id set from metadata and extracted tweets.
- `errors`: GraphQL errors array (if provided).
- `__original`: Full GraphQL response payload for compatibility/debugging.

### `tweets[]` summary fields
- `tweetId`: Stable tweet id (`rest_id`).
- `fullText`: Tweet text (`legacy.full_text`).
- `user`: Author summary (`userId`, `name`, `screenName`, `verified`, `profileImageUrl`).
- `stats`: Engagement summary (`replyCount`, `retweetCount`, `likeCount`, `quoteCount`, `bookmarkCount`).
- `viewerState`: Viewer interactions (`bookmarked`, `favorited`, `retweeted`).
- `inReplyToTweetId` / `inReplyToUserId`: Thread linkage.

### Error handling
- GraphQL-level errors are returned in top-level `errors[]`.
- Non-2xx HTTP responses are surfaced as runtime errors in `index.ts`.
- If you need unflattened payload branches, read `response.__original`.

## Minimal usage example

```ts
import { tweetDetail } from '../api';

const response = await tweetDetail({
  detailId: '42'
});
```

## Override usage example

```ts
import { tweetDetail } from '../api';

const response = await tweetDetail({
  detailId: '42',
  variablesOverride: {
    referrer: 'TweetDetailPage'
  },
  featuresOverride: {
    articles_preview_enabled: false,
    interactive_text_enabled: false
  },
  fieldTogglesOverride: {
    withGrokAnalyze: true
  }
});
```

## Security and stability
- Do not persist real authorization/cookie/csrf token values in source files.
- Keep request feature flags close to fresh captures; stale flags can alter response branches.
- Response branches can drift frequently, so keep unknown fallbacks only at unstable subtrees and refresh types when captures change.
