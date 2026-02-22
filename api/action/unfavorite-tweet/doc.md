# unfavorite-tweet

## Purpose
Remove a like (unfavorite) from a tweet via Twitter/X GraphQL mutation.

Typical usage:
- unlike flow in extension tweet actions,
- rollback after optimistic like operations,
- bulk cleanup of liked items.

## Endpoint
- Method: `POST`
- Path pattern: `/i/api/graphql/*/UnfavoriteTweet`
- OperationName: `UnfavoriteTweet`

## Parameter Strategy

This module follows the `action-minimal-input` pattern:
- Required business field: `tweetId`.
- Protocol defaults (queryId/operationName/variables) are centralized in `default.ts`.
- Caller can override low-level protocol values using `variablesOverride` and request metadata fields.

## Request Type
Type name: `UnfavoriteTweetRequest`

### Core fields
- `tweetId`: Required tweet id to unlike. Mapped to `variables.tweet_id`.
- `variablesOverride`: Partial override for raw GraphQL variables.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.
- `endpoint` / `queryId` / `operationName`: Optional protocol overrides.

### Default behavior
`buildUnfavoriteTweetRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `variablesOverride`,
3. explicit business field (`tweetId`).

So `tweetId` always wins over `variablesOverride.tweet_id`.

## Response Type
Type name: `UnfavoriteTweetResponse`

### Normalized top-level fields
- `success`: `true` when response message exists and GraphQL error list is empty.
- `tweetId`: Requested tweet id from input.
- `message`: Server-returned status string from `data.unfavorite_tweet` (usually `Done`).
- `errors`: GraphQL errors array (if provided).
- `__original`: Full GraphQL payload for compatibility/debugging.

## Minimal usage example

```ts
import { unfavoriteTweet } from '../api';

const response = await unfavoriteTweet({
  tweetId: '2025167189050053035'
});
```

## Override usage example

```ts
import { unfavoriteTweet } from '../api';

const response = await unfavoriteTweet({
  tweetId: '2025167189050053035',
  variablesOverride: {
    tweet_id: '2025167189050053035'
  }
});
```

## Security and stability
- Never persist real auth/cookie/csrf values into source files.
- QueryId and mutation variable shape can change over time; refresh from fresh captures when failures appear.
- Use normalized fields for business logic, and use `__original` for fallback/diagnostics.

## Normalized response mapping
- `success` summarizes mutation message presence + GraphQL error state.
- `tweetId` reflects caller intent (requested target id).
- `message` reflects server unfavorite result string (`Done` in current sample).
- `__original` keeps full payload to preserve compatibility with unnormalized branches.
