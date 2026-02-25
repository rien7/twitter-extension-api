# block

## Purpose
Block a target user via Twitter/X REST endpoint `blocks/create`.

Typical usage:
- block from profile moderation actions,
- safety workflows and abuse prevention tools,
- extension-level relationship controls.

## Endpoint
- Method: `POST`
- Path: `/i/api/1.1/blocks/create.json`

## Parameter Strategy

This module follows the `action-minimal-input` pattern:
- Required business field: `userId`.
- Protocol defaults are centralized in `default.ts`.
- Caller can override low-level details via `formOverride`, `headers`, `endpoint`.

## Request Type
Type name: `BlockRequest`

### Core fields
- `userId`: Required target user id.
- `formOverride`: Optional partial override for request form.
- `headers`: Optional custom headers merged into shared request headers.
- `endpoint`: Optional endpoint override.

### Default behavior
`buildBlockRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `formOverride`,
3. explicit business field (`userId`).

So `userId` always wins over `formOverride.user_id`.

## Response Type
Type name: `BlockResponse`

### Normalized top-level fields
- `success`: `true` when server returns target user id and no REST errors.
- `targetUserId`: requested target id from input.
- `targetUser`: summary (`userId`, `name`, `screenName`, `description`, `relationship`).
- `relationship`: follow/block/mute related booleans from server payload.
- `errors`: REST error array when provided.
- `__original`: full REST payload.

## Minimal usage example

```ts
import { block } from '../api';

const response = await block({
  userId: '42'
});
```

## Override usage example

```ts
import { block } from '../api';

const response = await block({
  userId: '42',
  formOverride: {
    user_id: '42'
  }
});
```

## Security and stability
- Never persist real auth/cookie/csrf values into source files.
- Endpoint behavior and response shape can drift; refresh from latest captures when failures appear.
- Use normalized fields for business logic and `__original` for compatibility/debugging.

## Normalized response mapping
- `targetUser.userId` maps from `id_str`.
- `relationship` maps common relation booleans (`blocking`, `blocked_by`, `following`, ...).
- `__original` keeps full server payload.
