# user-tweets-and-replies

## Purpose
Fetch a user's tweets-and-replies timeline from Twitter/X GraphQL.

This API is suitable for extensions that need:
- profile replies tab rendering,
- cursor-based pagination for tweets-and-replies timeline,
- lightweight tweet/user metadata extraction.

## Endpoint
- Method: `GET`
- Path pattern: `/i/api/graphql/*/UserTweetsAndReplies`
- OperationName: `UserTweetsAndReplies`

## Parameter Strategy

This module follows the `action-minimal-input` style:
- `userId` is optional; default is self user id from `twid` cookie.
- Protocol-heavy defaults (queryId/variables/features/fieldToggles) live in `default.ts`.
- Callers can override defaults through `variablesOverride`, `featuresOverride`, `fieldTogglesOverride`.

## Request Type
Type name: `UserTweetsAndRepliesRequest`

### Core fields
- `userId`: Optional target user id for tweets-and-replies timeline (defaults to self user id from `twid` cookie).
- `count`: Convenience override for `variables.count`.
- `cursor`: Pagination cursor for next-page requests.
- `withCommunity`: Convenience override for community timeline branches.
- `withVoice`: Convenience override for voice metadata flag.
- `variablesOverride`: Partial override of full GraphQL variables.
- `featuresOverride`: Partial override of feature flags.
- `fieldTogglesOverride`: Partial override of field toggles.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.

### Default behavior
`buildUserTweetsAndRepliesRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. override objects,
3. explicit convenience fields and `userId` (if provided).

If `userId` is omitted, SDK uses self user id parsed from `twid` cookie.
If `userId` is provided, explicit value always wins over `variablesOverride.userId`.

## Response Type
Type name: `UserTweetsAndRepliesResponse`

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
import { userTweetsAndReplies } from '../api';

const response = await userTweetsAndReplies({
  // current account by default
});
```

## Override usage example

```ts
import { userTweetsAndReplies } from '../api';

const response = await userTweetsAndReplies({
  userId: '42',
  cursor: 'cursor-bottom-token',
  count: 40,
  withCommunity: false,
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
