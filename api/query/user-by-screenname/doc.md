# user-by-screenname

## Purpose
Fetch one user profile branch from X GraphQL by screen name.

Typical usage:
- resolve profile metadata before follow/block actions,
- prefill user card with normalized identity and relationship fields,
- detect unavailable/suspended profile lookups.

## Endpoint
- Method: `GET`
- Path pattern: `/i/api/graphql/*/UserByScreenName`
- OperationName: `UserByScreenName`

## Parameter Strategy

This module follows the `query + required business input` pattern:
- `screenName` is required.
- Protocol-level defaults (queryId/variables/features/fieldToggles) are centralized in `default.ts`.
- Callers can override protocol defaults through override fields.

## Request Type
Type name: `UserByScreenNameRequest`

### Core fields
- `screenName`: Required target handle; accepts `name` or `@name`.
- `withGrokTranslatedBio`: Optional convenience override for `variables.withGrokTranslatedBio`.
- `variablesOverride`: Partial override of GraphQL variables.
- `featuresOverride`: Partial override of feature flags.
- `fieldTogglesOverride`: Partial override of field toggles.
- `headers` / `endpoint`: Transport-level overrides.

### Default merge behavior
`buildUserByScreenNameRequest(input)` merges values in this order:
1. defaults from `default.ts`,
2. override objects (`variablesOverride`, `featuresOverride`, `fieldTogglesOverride`),
3. explicit business field (`screenName`) and explicit convenience field (`withGrokTranslatedBio`).

That means `screenName` always wins over `variablesOverride.screen_name`.

## Response Type
Type name: `UserByScreenNameResponse`

### Normalized top-level fields
- `found`: `true` when `user.result` resolves to a concrete user branch.
- `resultType`: GraphQL `user.result.__typename`.
- `user`: normalized `XUserSummary` (`userId`, `name`, `screenName`, `description`, `relationship`, ...).
- `capabilities`: normalized capability object (`isBlueVerified`, `canDm`, `canMediaTag`).
- `unavailableReason`: populated when result type is unavailable.
- `errors`: GraphQL errors array, if provided.
- `__original`: full GraphQL payload.

### Field extraction notes
- `user.description` prefers `profile_bio.description`, fallback `legacy.description`.
- relationship booleans are normalized into `user.relationship`.
- profile image prefers `avatar.image_url`, fallback `legacy.profile_image_url_https`.
- `capabilities` is mapped from user-level fields `is_blue_verified`, `dm_permissions.can_dm`, and `media_permissions.can_media_tag`.

## Minimal usage example

```ts
import { userByScreenName } from '../api';

const profile = await userByScreenName({
  screenName: 'Twitter'
});
```

## Override example

```ts
import { userByScreenName } from '../api';

const profile = await userByScreenName({
  screenName: '@Twitter',
  withGrokTranslatedBio: true,
  featuresOverride: {
    responsive_web_graphql_timeline_navigation_enabled: false
  },
  fieldTogglesOverride: {
    withPayments: true
  }
});
```

## Error model and edge cases
- Missing/blank `screenName` throws `user-by-screenname requires a non-empty screenName`.
- Non-JSON response throws `user-by-screenname returned non-JSON response (...)`.
- HTTP non-2xx response throws GraphQL message when available.
- `screenName` is normalized by trimming whitespace and stripping leading `@`.
- Unavailable users return `resultType` and `unavailableReason` while preserving payload in `__original`.

## Security and stability
- Never persist real auth/cookie/csrf token values in source files.
- GraphQL feature flags may drift over time; refresh defaults from new captures when needed.
- Prefer normalized fields for business logic and fall back to `__original` for compatibility/debugging.
