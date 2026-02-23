# followers-you-follow

## Purpose
Fetch a short list of accounts that:
- the current viewer already follows,
- and also follow the target user.

Typical usage:
- hover user avatar/card preview ("followed by people you follow"),
- show overlap count and first few user chips,
- lazy-load more overlap items with cursor pagination.

## Endpoint
- Method: `GET`
- Path: `/i/api/1.1/friends/following/list.json`

## Parameter Strategy

This module follows the `query + minimal business input` pattern:
- `userId` is optional; default is self user id from `twid` cookie.
- Stable default query params are centralized in `default.ts`.
- Callers can override low-level params through `paramsOverride`.

## Request Type
Type name: `FollowersYouFollowRequest`

### Core fields
- `userId`: Optional target user id for hover context.
- `count`: Optional page size override (default `3`).
- `cursor`: Optional cursor for pagination.
- `withTotalCount`: Optional switch for `with_total_count`.
- `paramsOverride`: Partial override for raw query params.
- `headers` / `endpoint`: transport-level overrides.

### Default merge behavior
`buildFollowersYouFollowRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `paramsOverride`,
3. explicit business fields (`userId`, `count`, `cursor`, `withTotalCount`).

If `userId` is omitted, SDK uses self user id parsed from `twid` cookie.
If `userId` is provided, explicit value always takes priority.

## Response Type
Type name: `FollowersYouFollowResponse`

### Normalized top-level fields
- `users`: summarized overlap users for immediate UI rendering.
- `totalCount`: server `total_count` (falls back to current page length when absent).
- `nextCursor` / `prevCursor` / `hasMore`: unified cursor pagination fields.
- `errors`: REST error array when provided.
- `__original`: full REST payload.

## Minimal usage example

```ts
import { followersYouFollow } from '../api';

const preview = await followersYouFollow({
  userId: '42'
});
```

## Override usage example

```ts
import { followersYouFollow } from '../api';

const nextPage = await followersYouFollow({
  userId: '42',
  count: 10,
  cursor: '1234567890',
  withTotalCount: true
});
```

## Pagination example

```ts
import { followersYouFollow } from '../api';

const page1 = await followersYouFollow({ userId: '42', count: 3 });
if (page1.nextCursor) {
  const page2 = await followersYouFollow({
    userId: '42',
    count: 3,
    cursor: page1.nextCursor
  });
}
```

## Error model and edge cases
- Non-JSON response throws `followers-you-follow returned non-JSON response (...)`.
- Non-2xx response throws message from `errors[0].message` when available.
- Cursor values `'0'` or empty strings are normalized to `undefined`.
- Invalid `count` (`<= 0` or non-finite) throws input validation error.

## Security and stability
- Never persist real auth/cookie/csrf values into source files.
- This endpoint behavior can drift with X experiments; refresh defaults when failures appear.
- Prefer normalized fields for business logic and use `__original` for compatibility/debugging.
