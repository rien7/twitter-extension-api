# follow

## Purpose
Follow a target user via Twitter/X REST endpoint `friendships/create`.

Typical usage:
- follow from profile/action buttons in extension UI,
- batch follow workflows,
- relationship-state refresh after user action.

## Endpoint
- Method: `POST`
- Path: `/i/api/1.1/friendships/create.json`

## Parameter Strategy

This module follows the `action-minimal-input` pattern:
- Required business field: `userId`.
- Protocol defaults (form fields) are centralized in `default.ts`.
- Caller can override low-level request details via `formOverride`, `headers`, `endpoint`.

## Request Type
Type name: `FollowRequest`

### Core fields
- `userId`: Required target user id.
- `formOverride`: Optional partial override for default form fields.
- `headers`: Optional custom headers merged into shared request headers.
- `endpoint`: Optional endpoint override.

### Default behavior
`buildFollowRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `formOverride`,
3. explicit business field (`userId`).

So `userId` always wins over `formOverride.user_id`.

## Response Type
Type name: `FollowResponse`

### Normalized top-level fields
- `success`: `true` when server returns target user id and no REST errors.
- `userId`: requested target id from input.
- `targetUser`: summary (`id`, `name`, `screenName`, `description`).
- `relationship`: follow/block/mute related booleans from server payload.
- `errors`: REST error array when provided.
- `__original`: full REST payload.

## Minimal usage example

```ts
import { follow } from '../api';

const response = await follow({
  userId: '42'
});
```

## Override usage example

```ts
import { follow } from '../api';

const response = await follow({
  userId: '42',
  formOverride: {
    include_want_retweets: '0'
  }
});
```

## Security and stability
- Never persist real auth/cookie/csrf values into source files.
- REST form fields may change across X experiments; refresh defaults from latest captures when action fails.
- Use normalized fields for business logic and `__original` for compatibility/debugging.

## Normalized response mapping
- `targetUser` is mapped from top-level user fields (`id_str`, `name`, `screen_name`).
- `relationship` is mapped from server booleans (`following`, `followed_by`, `blocking`, ...).
- `__original` keeps full server payload.
