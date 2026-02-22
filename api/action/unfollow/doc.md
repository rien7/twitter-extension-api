# unfollow

## Purpose
Unfollow a target user via Twitter/X REST endpoint `friendships/destroy`.

Typical usage:
- unfollow from profile/action buttons,
- cleanup relationship lists in automation flows,
- refresh relationship state after explicit user action.

## Endpoint
- Method: `POST`
- Path: `/i/api/1.1/friendships/destroy.json`

## Parameter Strategy

This module follows the `action-minimal-input` pattern:
- Required business field: `userId`.
- Protocol defaults (form fields) are centralized in `default.ts`.
- Caller can override low-level details via `formOverride`, `headers`, `endpoint`.

## Request Type
Type name: `UnfollowRequest`

### Core fields
- `userId`: Required target user id.
- `formOverride`: Optional partial override for default form fields.
- `headers`: Optional custom headers merged into shared request headers.
- `endpoint`: Optional endpoint override.

### Default behavior
`buildUnfollowRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `formOverride`,
3. explicit business field (`userId`).

So `userId` always wins over `formOverride.user_id`.

## Response Type
Type name: `UnfollowResponse`

### Normalized top-level fields
- `success`: `true` when server returns target user id and no REST errors.
- `userId`: requested target id from input.
- `targetUser`: summary (`id`, `name`, `screenName`, `description`).
- `relationship`: follow/block/mute related booleans from server payload.
- `errors`: REST error array when provided.
- `__original`: full REST payload.

## Minimal usage example

```ts
import { unfollow } from '../api';

const response = await unfollow({
  userId: '42'
});
```

## Override usage example

```ts
import { unfollow } from '../api';

const response = await unfollow({
  userId: '42',
  formOverride: {
    include_want_retweets: '0'
  }
});
```

## Security and stability
- Never persist real auth/cookie/csrf values into source files.
- REST form fields may drift over time; refresh defaults from latest captures when failures appear.
- Use normalized fields for business logic and `__original` for compatibility/debugging.

## Normalized response mapping
- `targetUser` is mapped from top-level fields (`id_str`, `name`, `screen_name`).
- `relationship` is mapped from booleans (`following`, `followed_by`, `blocking`, ...).
- `__original` keeps full server payload.
