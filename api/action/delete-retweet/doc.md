# delete-retweet

## Purpose
Undo a retweet (unretweet) via Twitter/X GraphQL mutation.

Typical usage:
- revert accidental retweets,
- provide retweet-toggle action in extension UI,
- run moderation flows that require unretweeting source tweets.

## Endpoint
- Method: `POST`
- Path pattern: `/i/api/graphql/*/DeleteRetweet`
- OperationName: `DeleteRetweet`

## Parameter Strategy

This module follows the `action-minimal-input` pattern:
- Required business field: `tweetId`.
- Protocol defaults (queryId/operationName/variables) are centralized in `default.ts`.
- Caller can override low-level protocol values using `variablesOverride` and request metadata fields.

## Request Type
Type name: `DeleteRetweetRequest`

### Core fields
- `tweetId`: Required source tweet id to unretweet. Mapped to `variables.source_tweet_id`.
- `darkRequest`: Convenience override for `variables.dark_request`.
- `variablesOverride`: Partial override for raw GraphQL variables.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.
- `endpoint` / `queryId` / `operationName`: Optional protocol overrides.

### Default behavior
`buildDeleteRetweetRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `variablesOverride`,
3. explicit business fields (`tweetId`, `darkRequest`).

So `tweetId` always wins over `variablesOverride.source_tweet_id`.

## Response Type
Type name: `DeleteRetweetResponse`

### Normalized top-level fields
- `success`: `true` when mutation branch exists and GraphQL error list is empty.
- `sourceTweetId`: Requested source tweet id from input.
- `unretweetedTweetId`: Server-returned id from `data.unretweet.source_tweet_results.result.rest_id` when available.
- `errors`: GraphQL errors array (if provided).
- `__original`: Full GraphQL payload for compatibility/debugging.

## Minimal usage example

```ts
import { deleteRetweet } from '../api';

const response = await deleteRetweet({
  tweetId: '2024887415656325141'
});
```

## Override usage example

```ts
import { deleteRetweet } from '../api';

const response = await deleteRetweet({
  tweetId: '2024887415656325141',
  darkRequest: true,
  variablesOverride: {
    dark_request: false
  }
});
```

## Security and stability
- Never persist real auth/cookie/csrf values into source files.
- QueryId and mutation variable shape can change over time; refresh from fresh captures when failures appear.
- Use normalized fields for business logic, and use `__original` for fallback/diagnostics.

## Normalized response mapping
- `success` summarizes mutation branch presence + GraphQL error state.
- `sourceTweetId` reflects caller intent (requested source tweet id).
- `unretweetedTweetId` reflects server-confirmed source tweet id when returned.
- `__original` keeps full payload to preserve compatibility with unnormalized branches.
