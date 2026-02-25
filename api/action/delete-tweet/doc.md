# delete-tweet

## Purpose
Delete one of the current user's tweets via Twitter/X GraphQL mutation.

Typical usage:
- remove a just-posted tweet,
- clean up scheduled or test tweets,
- build extension-level moderation/delete workflows.

## Endpoint
- Method: `POST`
- Path pattern: `/i/api/graphql/*/DeleteTweet`
- OperationName: `DeleteTweet`

## Parameter Strategy

This module follows the `action-minimal-input` pattern:
- Required business field: `tweetId`.
- Protocol defaults (queryId/operationName/variables) are centralized in `default.ts`.
- Caller can override low-level protocol values using `variablesOverride` and request metadata fields.

## Request Type
Type name: `DeleteTweetRequest`

### Core fields
- `tweetId`: Required tweet id to delete. Mapped to `variables.tweet_id`.
- `darkRequest`: Convenience override for `variables.dark_request`.
- `variablesOverride`: Partial override for raw GraphQL variables.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.
- `endpoint` / `queryId` / `operationName`: Optional protocol overrides.

### Default behavior
`buildDeleteTweetRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `variablesOverride`,
3. explicit business fields (`tweetId`, `darkRequest`).

So `tweetId` always wins over `variablesOverride.tweet_id`.

## Response Type
Type name: `DeleteTweetResponse`

### Normalized top-level fields
- `success`: `true` when mutation branch exists and GraphQL error list is empty.
- `targetTweetId`: requested tweet id from input.
- `resultTweetId`: server-returned id from `data.delete_tweet.tweet_results.result.rest_id` when available.
- `errors`: GraphQL errors array (if provided).
- `__original`: Full GraphQL payload for compatibility/debugging.

## Minimal usage example

```ts
import { deleteTweet } from '../api';

const response = await deleteTweet({
  tweetId: '42'
});
```

## Override usage example

```ts
import { deleteTweet } from '../api';

const response = await deleteTweet({
  tweetId: '42',
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
- `targetTweetId` reflects caller intent (requested target id).
- `resultTweetId` reflects server-confirmed deletion target when returned.
- `__original` keeps full payload to preserve compatibility with unnormalized branches.
