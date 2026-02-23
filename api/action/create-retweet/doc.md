# create-retweet

## Purpose
Retweet a source tweet via Twitter/X GraphQL mutation.

Typical usage:
- retweet action from tweet cards,
- optimistic retweet toggles in extension UI,
- workflow actions that amplify selected source tweets.

## Endpoint
- Method: `POST`
- Path pattern: `/i/api/graphql/*/CreateRetweet`
- OperationName: `CreateRetweet`

## Parameter Strategy

This module follows the `action-minimal-input` pattern:
- Required business field: `tweetId`.
- Protocol defaults (queryId/operationName/variables) are centralized in `default.ts`.
- Caller can override low-level protocol values using `variablesOverride` and request metadata fields.

## Request Type
Type name: `CreateRetweetRequest`

### Core fields
- `tweetId`: Required source tweet id to retweet. Mapped to `variables.tweet_id`.
- `darkRequest`: Convenience override for `variables.dark_request`.
- `variablesOverride`: Partial override for raw GraphQL variables.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.
- `endpoint` / `queryId` / `operationName`: Optional protocol overrides.

### Default behavior
`buildCreateRetweetRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `variablesOverride`,
3. explicit business fields (`tweetId`, `darkRequest`).

So `tweetId` always wins over `variablesOverride.tweet_id`.

## Response Type
Type name: `CreateRetweetResponse`

### Normalized top-level fields
- `success`: `true` when mutation branch exists and GraphQL error list is empty.
- `sourceTweetId`: Requested source tweet id from input.
- `retweetId`: Server-returned retweet id from `data.create_retweet.retweet_results.result.rest_id` when available.
- `errors`: GraphQL errors array (if provided).
- `__original`: Full GraphQL payload for compatibility/debugging.

## Error model and failure cases
- Throws when `tweetId` is empty.
- Throws when HTTP status is non-2xx.
- Throws when response is not valid JSON.
- Includes GraphQL `errors` in normalized response when server returns them.

## Minimal usage example

```ts
import { createRetweet } from '../api';

const response = await createRetweet({
  tweetId: '42'
});
```

## Override/default-params example

```ts
import { createRetweet } from '../api';

const response = await createRetweet({
  tweetId: '42',
  darkRequest: true,
  variablesOverride: {
    dark_request: false
  }
});
```

## Security and stability notes
- Never persist real auth/cookie/csrf values into source files.
- QueryId and mutation variable shape can change over time; refresh from fresh captures when failures appear.
- Use normalized fields for business logic, and use `__original` for fallback/diagnostics.
