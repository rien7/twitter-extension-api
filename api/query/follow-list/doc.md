# follow-list

## Purpose
Query a user's following list (`Following`) via Twitter/X GraphQL timeline API.

Typical usage:
- fetch accounts a user currently follows,
- paginate following list in extension side panels,
- inspect relationship state (`following`, `followed_by`, `blocking`, `muting`).

## Endpoint
- Method: `GET`
- Path pattern: `/i/api/graphql/*/Following`
- OperationName: `Following`

## Parameter Strategy

This module follows the `query` + `minimal business input` pattern:
- `userId` is optional; default is self user id from `twid` cookie.
- Defaults (queryId/variables/features) are centralized in `default.ts`.
- Callers can override low-level values through `variablesOverride` and `featuresOverride`.

## Request Type
Type name: `FollowListRequest`

### Core fields
- `userId`: Optional target user id (defaults to self user id parsed from `twid` cookie).
- `count`: Optional page size override.
- `cursor`: Optional cursor for next page.
- `includePromotedContent` / `withGrokTranslatedBio`: convenience variable overrides.
- `variablesOverride`: partial raw variables override.
- `featuresOverride`: partial feature flags override.
- `headers` / `endpoint` / `queryId` / `operationName`: protocol-level overrides.

### Default merge behavior
`buildFollowListRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `variablesOverride` / `featuresOverride`,
3. explicit convenience fields (`userId`, `count`, `cursor`, ...).

If `userId` is omitted, SDK uses self user id parsed from `twid` cookie.
If `userId` is provided, explicit value always takes priority.

## Response Type
Type name: `FollowListResponse`

### Normalized top-level fields
- `instructions`: original timeline instructions array.
- `entries`: flattened entries from `TimelineAddEntries`.
- `users`: extracted user summaries for common usage.
- `cursorTop` / `cursorBottom`: compatibility cursor aliases.
- `nextCursor` / `prevCursor` / `hasMore`: SDK unified cursor contract.
- `errors`: GraphQL errors array when provided.
- `__original`: full GraphQL payload.

## Minimal usage example

```ts
import { followList } from '../api';

const page = await followList({
  // use current account by default
});
```

## Override usage example

```ts
import { followList } from '../api';

const nextPage = await followList({
  userId: '1882474049324081152',
  cursor: '1847321620788932295|2025507657086926796',
  count: 40,
  featuresOverride: {
    responsive_web_graphql_timeline_navigation_enabled: false
  }
});
```

## Security and stability
- Never persist real auth/cookie/csrf values into source files.
- QueryId and feature flags may change over time; refresh from latest captures when API fails.
- Prefer normalized top-level fields for business logic, and use `__original` for compatibility/debugging.

## Normalized response mapping
- `users` maps `TimelineUser` entries into a stable summary.
- `nextCursor = cursorBottom`, `prevCursor = cursorTop`, `hasMore = Boolean(nextCursor)`.
- `__original` preserves the complete server payload for fallback access.
