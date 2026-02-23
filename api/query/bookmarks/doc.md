# bookmarks

## Purpose
Fetch the current account's bookmark timeline from Twitter/X GraphQL.

This API is suitable for:
- rendering saved tweets,
- loading additional pages with cursor pagination,
- extracting stable tweet/user summary fields while keeping raw payload.

## Endpoint
- Method: `GET`
- Path pattern: `/i/api/graphql/*/Bookmarks`
- OperationName: `Bookmarks`

## Parameter Strategy

This module follows the query-minimal-input style:
- no required business field;
- protocol defaults (`queryId`, `variables`, `features`) are in `default.ts`;
- callers can override low-level fields with `variablesOverride` and `featuresOverride`.

## Request Type
Type name: `BookmarksRequest`

### Core fields
- `count`: Optional convenience override for `variables.count`.
- `cursor`: Optional pagination cursor for next-page requests.
- `includePromotedContent`: Optional convenience override for `variables.includePromotedContent`.
- `variablesOverride`: Partial override of full GraphQL variables.
- `featuresOverride`: Partial override of feature flags.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.
- `endpoint` / `queryId` / `operationName`: Optional protocol overrides.

### Default behavior
`buildBookmarksRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. override objects,
3. explicit convenience fields (`count`, `includePromotedContent`, `cursor`).

## Response Type
Type name: `BookmarksResponse`

### Normalized top-level fields
- `instructions`: Raw timeline instruction array from `data.bookmark_timeline_v2.timeline.instructions`.
- `entries`: Flattened entries from `TimelineAddEntries` instructions.
- `tweets`: Frequently used tweet summaries extracted from timeline entries.
- `cursorTop`: Top cursor if present.
- `cursorBottom`: Bottom cursor if present.
- `nextCursor`: Standardized next-page cursor (same as `cursorBottom`).
- `prevCursor`: Standardized previous-page cursor (same as `cursorTop`).
- `hasMore`: Whether next-page cursor exists.
- `conversationTweetIds`: Aggregated tweet ids from module metadata and extracted tweets.
- `errors`: GraphQL errors array (if provided).
- `__original`: Full parsed GraphQL payload for compatibility/debugging.

### `tweets[]` summary fields
- `tweetId`: Stable tweet id (`rest_id`).
- `fullText`: Tweet text content.
- `user`: Author summary (`userId`, `name`, `screenName`, `verified`, `profileImageUrl`).
- `stats`: Engagement counters (`replyCount`, `retweetCount`, `likeCount`, `quoteCount`, `bookmarkCount`).
- `viewerState`: Viewer interactions (`bookmarked`, `favorited`, `retweeted`).
- `conversationId` / `inReplyToTweetId` / `inReplyToUserId`: Conversation linkage metadata.

## Error model and failure cases
- Throws when HTTP status is non-2xx.
- Throws when response is not valid JSON.
- Preserves GraphQL `errors` in normalized response when server returns them.

## Minimal usage example

```ts
import { bookmarks } from '../api';

const page = await bookmarks({
  count: 20
});
```

## Override/default-params example

```ts
import { bookmarks } from '../api';

const page = await bookmarks({
  count: 40,
  includePromotedContent: false,
  variablesOverride: {
    count: 30
  },
  featuresOverride: {
    articles_preview_enabled: false
  }
});
```

## Pagination example

```ts
import { bookmarks } from '../api';

const firstPage = await bookmarks({ count: 20 });

if (firstPage.nextCursor) {
  const secondPage = await bookmarks({
    count: 20,
    cursor: firstPage.nextCursor
  });

  console.log(secondPage.hasMore, secondPage.nextCursor);
}
```

## Security and stability notes
- Never persist real authorization/cookie/csrf token values in source artifacts.
- QueryId and feature flags may change over time; refresh from new captures when failures appear.
- Prefer normalized fields for business logic and use `__original` for fallback diagnostics.
