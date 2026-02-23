# create-tweet

## Purpose
Publish a tweet via Twitter/X GraphQL `CreateTweet` mutation.

This API supports three explicit modes:
- direct tweet: standalone post,
- reply tweet: post under another tweet,
- quote tweet: post with quoted tweet attachment.

## Endpoint
- Method: `POST`
- Path pattern: `/i/api/graphql/*/CreateTweet`
- OperationName: `CreateTweet`

## Parameter Strategy

This module follows the `action-minimal-input` pattern with mode-aware behavior:
- Required business field: `tweetText`.
- Optional mode field: `mode` (`direct` / `reply` / `quote`).
- Protocol defaults (`queryId`, `operationName`, `variables`, `features`) are in `default.ts`.
- Callers can override low-level protocol fields using `variablesOverride`, `featuresOverride`, and request metadata fields.

## Request Type
Type name: `CreateTweetRequest`

### Common fields
- `tweetText`: Required text body. Mapped to `variables.tweet_text`.
- `darkRequest`: Convenience override for `variables.dark_request`.
- `mediaEntities`: Convenience override for `variables.media.media_entities`.
- `possiblySensitive`: Convenience override for `variables.media.possibly_sensitive`.
- `semanticAnnotationIds`: Convenience override for `variables.semantic_annotation_ids`.
- `disallowedReplyOptions`: Convenience override for `variables.disallowed_reply_options`.
- `variablesOverride`: Partial variable override.
- `featuresOverride`: Partial feature-flag override.
- `headers`, `endpoint`, `queryId`, `operationName`: protocol-level overrides.

### Mode-specific fields
- direct mode (`mode` omitted or `mode: 'direct'`):
  - no extra required fields.
  - forces `variables.reply` and `variables.attachment_url` to be removed.
- reply mode (`mode: 'reply'`):
  - required: `inReplyToTweetId`.
  - optional: `excludeReplyUserIds`.
  - forces `variables.reply` and removes `variables.attachment_url`.
- quote mode (`mode: 'quote'`):
  - required: `attachmentUrl` or `quoteTweetId`.
  - forces `variables.attachment_url` and removes `variables.reply`.

### Default + override precedence
`buildCreateTweetRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `variablesOverride` and `featuresOverride`,
3. explicit business fields (`tweetText`, mode-specific fields, convenience overrides).

So mode-specific required fields always win over conflicting variable overrides.

## Response Type
Type name: `CreateTweetResponse`

### Normalized top-level fields
- `success`: `true` when mutation result exists and no GraphQL error list is returned.
- `requestedMode`: mode resolved from request input.
- `mode`: mode detected from response (`legacy.in_reply_to_status_id_str` / `legacy.is_quote_status`) with fallback to `requestedMode`.
- `tweetId`: created tweet id from `result.rest_id` (fallback `legacy.id_str`).
- `text`: canonical text from `legacy.full_text`.
- `authorUserId`: created tweet author id.
- `conversationId`: conversation id from `legacy.conversation_id_str`.
- `inReplyToTweetId`, `inReplyToUserId`, `inReplyToScreenName`: reply linkage fields.
- `quotedTweetId`: quoted source tweet id.
- `errors`: GraphQL errors array when provided.
- `__original`: full GraphQL payload.

## Error model and failure cases
- Throws when `tweetText` is empty.
- Throws when `mode: 'reply'` but `inReplyToTweetId` is missing.
- Throws when `mode: 'quote'` but both `attachmentUrl` and `quoteTweetId` are missing.
- Throws when HTTP status is non-2xx.
- Throws when response is not valid JSON.
- Keeps GraphQL `errors` in normalized response when server includes them.

## Minimal usage examples

### Direct tweet

```ts
import { createTweet } from '../api';

const response = await createTweet({
  tweetText: 'Shipping update today.'
});
```

### Reply tweet

```ts
import { createTweet } from '../api';

const response = await createTweet({
  mode: 'reply',
  tweetText: 'I agree.',
  inReplyToTweetId: '42',
  excludeReplyUserIds: []
});
```

### Quote tweet

```ts
import { createTweet } from '../api';

const response = await createTweet({
  mode: 'quote',
  tweetText: 'Context here.',
  quoteTweetId: '42'
});
```

## Override/default-params example

```ts
import { createTweet } from '../api';

const response = await createTweet({
  mode: 'quote',
  tweetText: 'Debug run',
  quoteTweetId: '42',
  darkRequest: true,
  variablesOverride: {
    dark_request: false
  },
  featuresOverride: {
    responsive_web_enhance_cards_enabled: true
  }
});
```

In this example, final `dark_request` is `true` because convenience fields are applied after `variablesOverride`.

## Security and stability notes
- Never persist real auth/cookie/csrf values into source files.
- QueryId and feature flags can change over time; refresh defaults from fresh captures when the mutation fails.
- Use normalized fields for business logic and `__original` for diagnostics/compatibility fallback.
