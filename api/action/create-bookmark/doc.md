# create-bookmark

## Purpose
Add a bookmark for a tweet via Twitter/X GraphQL mutation.

Typical usage:
- bookmark action from tweet cards,
- save tweet for later workflows,
- keep client-side bookmark state in sync after user actions.

## Endpoint
- Method: `POST`
- Path pattern: `/i/api/graphql/*/CreateBookmark`
- OperationName: `CreateBookmark`

## Parameter Strategy

This module follows the `action-minimal-input` pattern:
- Required business field: `tweetId`.
- Protocol defaults (queryId/operationName/variables) are centralized in `default.ts`.
- Caller can override low-level protocol values using `variablesOverride` and request metadata fields.

## Request Type
Type name: `CreateBookmarkRequest`

### Core fields
- `tweetId`: Required tweet id to bookmark. Mapped to `variables.tweet_id`.
- `variablesOverride`: Partial override for raw GraphQL variables.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.
- `endpoint` / `queryId` / `operationName`: Optional protocol overrides.

### Default behavior
`buildCreateBookmarkRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `variablesOverride`,
3. explicit business field (`tweetId`).

So `tweetId` always wins over `variablesOverride.tweet_id`.

## Response Type
Type name: `CreateBookmarkResponse`

### Normalized top-level fields
- `success`: `true` when response message exists and GraphQL error list is empty.
- `tweetId`: Requested tweet id from input.
- `message`: Server-returned status string from `data.tweet_bookmark_put` (usually `Done`).
- `errors`: GraphQL errors array (if provided).
- `__original`: Full GraphQL payload for compatibility/debugging.

## Error model and failure cases
- Throws when `tweetId` is empty.
- Throws when HTTP status is non-2xx.
- Throws when response is not valid JSON.
- Includes GraphQL `errors` in normalized response when server returns them.

## Minimal usage example

```ts
import { createBookmark } from '../api';

const response = await createBookmark({
  tweetId: '42'
});
```

## Override/default-params example

```ts
import { createBookmark } from '../api';

const response = await createBookmark({
  tweetId: '42',
  queryId: 'custom-query-id',
  variablesOverride: {
    tweet_id: '42'
  }
});
```

## Security and stability notes
- Never persist real auth/cookie/csrf values into source files.
- QueryId and mutation variable shape can change over time; refresh from fresh captures when failures appear.
- Use normalized fields for business logic, and use `__original` for fallback/diagnostics.
