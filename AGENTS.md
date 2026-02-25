# AGENTS.md

This file defines contributor rules for AI agents and human maintainers in this repository.

## Project Objective

Build and maintain a reusable Twitter/X extension API SDK that:
1. intercepts XHR/fetch traffic from the page main world,
2. records unknown GraphQL/REST contracts into `window.x.__unknown_api`,
3. exposes stable APIs under `window.x.api.query` / `window.x.api.action`.

`example-project` is a behavior reference for legacy capture/replay logic.
Use it for semantics only, not as direct copy target.

## Non-Negotiable Rules

1. Do not use code-generation scripts to directly write `api/*` source files.
2. Top-level request/response types must be explicit. Do not use `[key: string]: unknown` as final top-level contract.
3. `__desc` is plain-text quick help for end users.
   - It must be short and scannable.
   - It must be a string, not an object.
   - It must explain: purpose, call pattern, required params, optional params, and key response fields.
   - Accessing `api.__desc` must auto-print the text via `console.log`.
4. `__default_params` must be provided for APIs that use `default.ts`.
   - It should expose safe default request metadata (`endpoint`, `operationName`, `queryId`, default variables/features/fieldToggles).
   - Never include sensitive values.
5. Machine-only metadata must be placed in `__meta`, not `__desc`.
   - `__meta` is used for known-API matching and pagination behavior.
6. No compatibility fallback for legacy descriptor shape.
   - Do not read or write the old object-style `__desc`.
   - Do not add dual-mode compatibility branches.
7. `doc.md` is the detailed developer document.
   - Include field-level meanings for request/response.
   - Include errors, edge cases, and code examples.
8. Every exported API callable must have JSDoc.
   - Include `@summary`, `@param`, `@returns`, and at least one `@example`.
9. Keep `index.ts` thin.
   - `index.ts` should primarily wire together desc/default/fetch/normalize.
   - Put request transport and response normalization into dedicated files.
10. GraphQL headers must use shared builder logic from `src/sdk/request-headers.ts`.
11. Query APIs requiring `userId` must default to self user id from cookie `twid`.
   - Parse URL-encoded `twid` value (example: `u%3D42`) and extract digits only.
   - `input.userId` has priority over fallback user id.
12. GraphQL responses must expose normalized top-level fields and keep full payload in `__original`.
13. Sensitive values must remain redacted.
   - Never persist real auth/cookie/csrf token values.
14. All hard-coded tweet-id examples must use `42`.
   - Applies to API examples in `doc.md`, JSDoc examples, test fixtures, and JSON samples.
   - Use explicit field names (`tweetId`, `tweet_id`, `source_tweet_id`, `focalTweetId`, etc.), not bare literals.
15. Unknown API GraphQL fingerprinting must normalize tweet-id-like variables before hashing.
   - Before computing `variablesShapeHash`, replace tweet-id-like variable values with `42`.
   - This avoids duplicate unknown records for the same operation caused only by different tweet ids.
16. All normalized tweet/user outputs must use shared summary types from `src/shared/types.ts`.
   - Use `XTweetSummary` for tweet-like normalized objects.
   - Use `XUserSummary` for user-like normalized objects.
   - Put relationship booleans under `user.relationship` (not flattened on user root).
   - Put tweet view count under `tweet.stats.viewCount` (not top-level `tweet.viewCount`).
   - Quoted tweet linkage must use `quotedTweet?: XTweetSummary` (not `quotedTweetId`).
   - Action `targetUser` summary must use `userId` (not `id`).
17. Normalized responses must use shared base response structures from `src/shared/types.ts`.
   - Query timeline-like responses should extend `XTweetTimelineResponseBase` or `XUserTimelineResponseBase`.
   - Other query responses should extend `XResponseBase`.
   - Action responses should extend `XActionResponseBase`; user-target actions use `XTargetUserActionResponseBase`, tweet-target actions use `XTargetTweetActionResponseBase`.
   - Top-level target id fields must be standardized as `targetUserId` / `targetTweetId`.
   - If mutation response returns a canonical tweet id, expose it as `resultTweetId`.
   - Create-tweet style responses expose created content as `resultTweet` (`XTweetSummary`), not duplicated tweet fields on response root.
18. Do not keep legacy/transitional alias fields on normalized response root.
   - Forbidden aliases include: `userId` (as target action id), `tweetId` (as target action id), `sourceTweetId`, `retweetId`, `deletedTweetId`, `restId`, `legacyId`.
   - Put non-standard raw values under `__original`, or map into shared summary objects.

## API Module Layout

Required structure for each API:

```txt
api/<query|action>/<kebab-id>/
  doc.md
  types.ts
  desc.ts
  fetch.ts
  normalize.ts
  index.ts
  default.ts         # required when stable defaults exist
```

Notes:
1. `desc.ts` holds `__desc`, `__default_params`, and `__meta`.
2. `fetch.ts` handles transport and protocol-level error handling.
3. `normalize.ts` extracts stable top-level fields from nested GraphQL payload.
4. `index.ts` only composes and exports callable API.
5. Do not keep transport/normalize implementation in `index.ts`.

## Callable Contract

Each callable should follow this runtime shape:

```ts
type XCallableApi<I, O, D = unknown> = ((input?: I) => Promise<O>) & {
  __desc: string;
  __default_params?: D;
  __meta: {
    id: string;
    title: string;
    match: {
      method?: string;
      path?: string;
      operationName?: string;
      variablesShapeHash?: string;
    };
    requestTypeName: string;
    responseTypeName: string;
    pagination?: {
      strategy: 'cursor';
      countParam: string;
      cursorParam: string;
      nextCursorField: string;
      prevCursorField?: string;
      hasMoreField?: string;
      defaultCount?: number;
      minCount?: number;
      maxCount?: number;
    };
  };
};
```

Rules:
1. `__desc` must be plain text and concise.
2. `__default_params` should be frozen snapshot-style metadata from defaults.
3. `__meta` must contain all matching/pagination metadata required by runtime logic.

## `__desc` Format Guideline

Use plain text lines. Keep it short:

```txt
[follow-list]
Purpose: Fetch following list for a user.
Call: window.x.api.query.followList(input?)
Input:
  Required:
    - none (userId defaults to self from twid)
  Optional:
    - userId
    - count
    - cursor
    - variablesOverride
    - featuresOverride
Pagination: count + cursor -> nextCursor / prevCursor / hasMore
Returns: users, entries, nextCursor, hasMore, errors
```

## `doc.md` Detailed Contract

Each `doc.md` must include:
1. Purpose and scenario.
2. Endpoint/method/operationName.
3. Request fields with meaning, default, and precedence.
4. Response fields with meaning and extraction source.
5. Error model and typical failure cases.
6. Minimal usage example.
7. Override/default-params example.
8. Pagination example when applicable.
9. Security and stability notes.

## Response Normalization Rules

1. Keep complete parsed server payload in `__original`.
2. Extract high-frequency business fields to top-level properties.
3. For paginated APIs expose:
   - `nextCursor?: string`
   - `prevCursor?: string`
   - `hasMore: boolean`
4. Do not add compatibility aliases in normalized root fields (current version is unreleased).
5. Prioritize shared base fields before adding API-private root fields:
   - Base: `errors`, `__original`
   - Cursor page: `cursorTop`, `cursorBottom`, `nextCursor`, `prevCursor`, `hasMore`
   - User-target action: `success`, `targetUserId`, `targetUser`, `relationship`
   - Tweet-target action: `success`, `targetTweetId`, `targetTweet`
   - Result id/action outcome: `resultTweetId` when applicable

## Shared Summary Conversion Rules

When normalizing payloads, apply these mappings consistently:
1. Any normalized tweet object must conform to `XTweetSummary`.
2. Any normalized user object must conform to `XUserSummary`.
3. Convert `legacy` relation booleans into `user.relationship`.
4. Convert raw view-count branches into `stats.viewCount`.
5. Convert quote-link fields into `quotedTweet` summary objects.

## Runtime Registration Rules

1. Register by scope:
   - `window.x.api.query.<lowerCamelCase>`
   - `window.x.api.action.<lowerCamelCase>`
2. Keep API id in kebab-case inside `__meta.id`.

## API Generation Workflow (AI/Human)

1. Export records from:
   - `window.x.__unknown_api.list()` or
   - `window.x.__unknown_api.toJSON(true)`.
2. Input may be a single record or a list.
3. Determine API scope (`query` vs `action`) and kebab-case id.
4. Implement required module files directly under `api/<scope>/<id>/`:
   - `types.ts`
   - `default.ts` (when defaults exist)
   - `desc.ts`
   - `fetch.ts`
   - `normalize.ts`
   - `index.ts`
   - `doc.md`
5. Register exports in `api/index.ts`.
6. Validate:

```bash
pnpm tsc --noEmit
pnpm test
pnpm build
```

## Working With `example-project`

When needed, inspect:
1. `example-project/src/interceptor/*` for capture/replay patterns.
2. `example-project/src/api/*` for request payload conventions.
3. `example-project/src/types/*` for practical type granularity.

Use these as behavior hints, then adapt to this repository's contracts.
