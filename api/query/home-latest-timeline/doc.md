# home-latest-timeline

## Purpose
Fetch the latest entries in the home timeline feed (Following/For You timeline stream) through Twitter/X GraphQL.

This API is suitable for extensions that need:
- timeline rendering,
- tweet cache warmup,
- cursor-based pagination,
- user/tweet metadata extraction.

## Endpoint
- Method: `POST`
- Path pattern: `/i/api/graphql/*/HomeLatestTimeline`
- OperationName: `HomeLatestTimeline`

## Parameter Strategy

This module uses `default.ts` to store default request payload.

- `homeLatestTimeline()` can be called with no arguments.
- You can pass only the fields you care about (for example `cursor`, `count`).
- You can still override any protocol-level value via `variablesOverride` and `featuresOverride`.

## Request Type
Type name: `HomeLatestTimelineRequest`

### Core fields
- `count`: Convenience override for default `variables.count`.
- `cursor`: Cursor for next-page loading.
- `seenTweetIds`: Previously seen tweet IDs used by backend ranking.
- `variablesOverride`: Partial override of full variables object.
- `featuresOverride`: Partial override of feature flags.
- `headers`: Optional custom headers merged into shared GraphQL headers.

### Notes for request construction
- Headers are built by shared `buildGraphqlHeaders` logic (authorization, csrf, language, x-twitter-* defaults).
- Keep `features` close to live traffic; missing flags can change response shape.
- Preserve `credentials: include` to reuse current logged-in session.
- For pagination, pass the `Bottom` cursor from prior response.

## Response Type
Type name: `HomeLatestTimelineResponse`

### Normalized top-level fields
- `instructions`: Raw timeline instruction array (lifted from GraphQL payload).
- `entries`: Flattened entries from `TimelineAddEntries` instructions.
- `tweets`: Frequently-used tweet summaries (id/text/author/stats/views).
- `cursorTop`: Top cursor value if present.
- `cursorBottom`: Bottom cursor value if present (used for next-page requests).
- `nextCursor`: Standardized next-page cursor (same value as `cursorBottom`).
- `prevCursor`: Standardized previous-page cursor (same value as `cursorTop`).
- `hasMore`: Whether next-page cursor exists.
- `errors`: GraphQL errors array (if provided).
- `__original`: Full GraphQL response payload for compatibility/debugging.

### `tweets[]` summary fields
- `tweetId`: Stable tweet id (`rest_id`).
- `fullText`: Tweet text content (`legacy.full_text`).
- `user`: Author summary (`userId`, `name`, `screenName`, `verified`, `profileImageUrl`).
- `stats`: Engagement summary (`replyCount`, `retweetCount`, `likeCount`, `quoteCount`, `bookmarkCount`).
- `stats.viewCount`: View count string.
- `entryId` / `sortIndex`: Timeline positioning metadata.

### Error handling
- GraphQL-level errors appear in top-level `errors[]`.
- HTTP-level failures should be handled via status code and thrown runtime error.
- If you need unflattened payload branches, read `response.__original`.

## Minimal usage example

```ts
import { homeLatestTimeline } from '../api';

const response = await homeLatestTimeline();
```

## Override usage example

```ts
import { homeLatestTimeline } from '../api';

const response = await homeLatestTimeline({
  cursor: 'cursor-bottom-token',
  count: 40,
  variablesOverride: {
    requestContext: 'manual-refresh'
  },
  featuresOverride: {
    articles_preview_enabled: false
  }
});
```

## Security and stability
- Never persist sensitive headers or auth tokens in source files.
- GraphQL field set can drift frequently; keep `types.ts` aligned with fresh captures.
- Use optional fields for unstable branches, but keep known stable fields explicit.
