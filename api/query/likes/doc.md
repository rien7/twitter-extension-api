# likes

## Purpose
Fetch a user's liked-tweets timeline from Twitter/X GraphQL.

This API is suitable for extensions that need:
- liked tweet feed rendering,
- cursor-based pagination for likes tab,
- lightweight tweet/user metadata extraction.

## Endpoint
- Method: `GET`
- Path pattern: `/i/api/graphql/*/Likes`
- OperationName: `Likes`

## Parameter Strategy

This module follows the `action-minimal-input` style:
- `userId` is optional; default is self user id from `twid` cookie.
- Protocol-heavy defaults (queryId/variables/features/fieldToggles) live in `default.ts`.
- Callers can override defaults through `variablesOverride`, `featuresOverride`, `fieldTogglesOverride`.

## Request Type
Type name: `LikesRequest`

### Core fields
- `userId`: Optional target user id for the likes timeline (defaults to self user id from `twid` cookie).
- `count`: Convenience override for `variables.count`.
- `cursor`: Pagination cursor for next-page requests.
- `variablesOverride`: Partial override of full GraphQL variables.
- `featuresOverride`: Partial override of feature flags.
- `fieldTogglesOverride`: Partial override of field toggles.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.

### Default behavior
`buildLikesRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. override objects,
3. explicit convenience fields and `userId` (if provided).

If `userId` is omitted, SDK uses self user id parsed from `twid` cookie.
If `userId` is provided, explicit value always wins over `variablesOverride.userId`.

## Response Type
Type name: `LikesResponse`

### Normalized top-level fields
- `instructions`: Raw timeline instruction array.
- `entries`: Flattened entries from `TimelineAddEntries`.
- `tweets`: Commonly used tweet summaries.
- `cursorTop`: Top cursor if present.
- `cursorBottom`: Bottom cursor if present.
- `nextCursor`: Standardized next-page cursor (same value as `cursorBottom`).
- `prevCursor`: Standardized previous-page cursor (same value as `cursorTop`).
- `hasMore`: Whether next-page cursor exists.
- `conversationTweetIds`: Aggregated tweet ids from module metadata and extracted tweets.
- `errors`: GraphQL errors array (if provided).
- `__original`: Full GraphQL payload for compatibility/debugging.

### `tweets[]` summary fields
- `tweetId`: Stable tweet id (`rest_id`).
- `fullText`: Tweet text content.
- `user`: Author summary (`userId`, `name`, `screenName`, `verified`, `profileImageUrl`).
- `stats`: Engagement counters (`replyCount`, `retweetCount`, `likeCount`, `quoteCount`, `bookmarkCount`).
- `viewerState`: Viewer interactions (`bookmarked`, `favorited`, `retweeted`).
- `conversationId` / `inReplyToTweetId` / `inReplyToUserId`: Conversation linkage metadata.

### Error handling
- GraphQL errors are exposed in top-level `errors[]`.
- Non-2xx HTTP responses throw runtime errors from `index.ts`.
- If unflattened branches are needed, read `response.__original`.

## Minimal usage example

```ts
import { likes } from '../api';

const response = await likes({
  // current account by default
});
```

## Override usage example

```ts
import { likes } from '../api';

const response = await likes({
  userId: '1882474049324081152',
  cursor: 'cursor-bottom-token',
  count: 40,
  variablesOverride: {
    withBirdwatchNotes: true
  },
  featuresOverride: {
    articles_preview_enabled: false
  },
  fieldTogglesOverride: {
    withArticlePlainText: true
  }
});
```

## Security and stability
- Do not persist real authorization/cookie/csrf token values.
- Keep feature flags aligned with fresh captures; stale flags may change response shape.
- Use normalized fields for business logic; reserve `__original` for compatibility/debugging.
