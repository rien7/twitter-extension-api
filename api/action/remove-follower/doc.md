# remove-follower

## Purpose
Remove a follower from the current account via Twitter/X GraphQL mutation `RemoveFollower`.

Typical usage:
- remove unwanted followers from extension tools,
- moderation/safety workflows,
- reconcile follower management actions.

## Endpoint
- Method: `POST`
- Path pattern: `/i/api/graphql/*/RemoveFollower`
- OperationName: `RemoveFollower`

## Parameter Strategy

This module follows the `action-minimal-input` pattern:
- Required business field: `targetUserId`.
- Protocol defaults (queryId/operationName/variables) are centralized in `default.ts`.
- Caller can override low-level values via `variablesOverride`, `headers`, `endpoint`.

## Request Type
Type name: `RemoveFollowerRequest`

### Core fields
- `targetUserId`: Required user id to remove.
- `variablesOverride`: Optional partial GraphQL variable override.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.
- `endpoint` / `queryId` / `operationName`: Optional protocol overrides.

### Default behavior
`buildRemoveFollowerRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `variablesOverride`,
3. explicit business field (`targetUserId`).

So `targetUserId` always wins over `variablesOverride.target_user_id`.

## Response Type
Type name: `RemoveFollowerResponse`

### Normalized top-level fields
- `success`: `true` when mutation branch exists and GraphQL error list is empty.
- `targetUserId`: requested target user id.
- `resultType`: value from `data.remove_follower.__typename`.
- `reason`: value from `data.remove_follower.unfollow_success_reason`.
- `errors`: GraphQL errors array when provided.
- `__original`: full GraphQL payload.

## Minimal usage example

```ts
import { removeFollower } from '../api';

const response = await removeFollower({
  targetUserId: '42'
});
```

## Override usage example

```ts
import { removeFollower } from '../api';

const response = await removeFollower({
  targetUserId: '42',
  variablesOverride: {
    target_user_id: '42'
  }
});
```

## Security and stability
- Never persist real auth/cookie/csrf values into source files.
- queryId and mutation schema may change over time; refresh from latest captures when failures appear.
- Use normalized fields for business logic and `__original` for compatibility/debugging.

## Normalized response mapping
- `resultType` and `reason` are extracted from `data.remove_follower`.
- `success` summarizes mutation branch presence and error state.
- `__original` keeps full server payload.
