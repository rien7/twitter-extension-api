# AGENTS.md

This file defines contributor rules for AI agents and human maintainers in this repository.

## Project Goal

Build and maintain a reusable Twitter/X extension API SDK that:
1. intercepts XHR/fetch traffic from page main world,
2. records unknown GraphQL/REST contracts into `window.x.__unknown_api`,
3. exposes stable APIs under `window.x.query` / `window.x.action` (and mirrored at `window.x.api.query` / `window.x.api.action`).

`example-project` is a reference implementation of previous XHR capture + API replay logic.
Use it as behavior reference, not as a direct copy target.

## Non-Negotiable Rules

1. **Do not use code-generation scripts for `api/*` source files.**
   - API module files must be written directly by AI/human.
   - If you need analysis, read unknown records directly from JSON and reason in-place.

2. **Types must be explicit and readable.**
   - Avoid `Record<string, unknown>` as top-level request/response contracts.
   - Use named nested interfaces with domain meaning.
   - Use fallback unknown only in truly unbounded regions.

3. **Public request input should be minimal and business-focused.**
   - For passive APIs (timeline-like), support zero/minimal input.
   - For action APIs (tweet-detail, create-tweet), expose only required business args (e.g. `detailId`) plus optional override fields.

4. **Use `default.ts` when defaults exist.**
   - Store default variables/features/query metadata in `default.ts`.
   - Build the final payload via `buildXxxRequest(input)`.

5. **`doc.md` and `__desc.doc` are developer-facing docs.**
   - Must explain request and response semantics, not placeholder text.
   - Must include endpoint, operationName, key fields, default behavior, and override strategy.

6. **Sensitive data must stay redacted.**
   - Never persist real tokens/cookies/authorization values.

7. **GraphQL request headers must use shared builder logic.**
   - Reuse `buildGraphqlHeaders` from `src/sdk/request-headers.ts`.
   - Do not hardcode per-API ad-hoc header sets.

8. **GraphQL response must expose both normalized fields and raw payload.**
   - Extract commonly-used fields into top-level response fields (allow moderate nesting).
   - Keep full parsed response under `__original`.
   - `__original` is for compatibility/debugging; business usage should prefer normalized fields.

9. **Cursor pagination must follow one SDK-wide contract.**
   - For cursor-paginable APIs, request input must support `count` and `cursor`.
   - Response must expose `nextCursor`, `prevCursor`, and `hasMore`.
   - Keep compatibility aliases (`cursorBottom`, `cursorTop`) when already used.
   - Set pagination metadata in `__desc.pagination` for runtime auto-pagination.

10. **API scope and naming are SDK-wide conventions.**
   - API source files must be placed under `api/query/*` or `api/action/*`.
   - `window.x` runtime access must use query/action split and lowerCamelCase keys.
   - For `blocks/*` and `friendships/*` create/destroy style endpoints, use semantic API ids:
     - `friendships/create` -> `follow`
     - `friendships/destroy` -> `unfollow`
     - `blocks/create` -> `block`
     - `blocks/destroy` -> `unblock`

11. **Query APIs that accept `userId` must support self-default resolution.**
   - On SDK bootstrap start, read `twid` cookie and resolve self user id.
   - `twid` format is URL-encoded (for example `u%3D1882474049324081152`); use digits only.
   - For `api/query/*` APIs with `userId`, `input.userId` is optional.
   - If omitted, resolve from initialized self user id; explicit `userId` always has priority.

## API Module Standard

Each API directory must contain:

```txt
api/<query|action>/<kebab-id>/
  doc.md
  types.ts
  index.ts
```

When an API has stable default request params, it must also contain:

```txt
api/<query|action>/<kebab-id>/
  default.ts
```

### `types.ts`

- Include all request/response types used by this API.
- Export all types.
- Prefix all type names with `<PascalCaseApiId>`.
- Separate public input type from fully-resolved payload type when needed.
- Response types should use a dual-layer structure:
  - `XxxResponse`: normalized, developer-friendly fields.
  - `XxxOriginalResponse`: full GraphQL raw shape.
  - `XxxResponse.__original: XxxOriginalResponse`.
- Normalize high-frequency data to top-level semantic fields (for example `tweets`, `users`, `cursorTop`, `cursorBottom`, `instructions`, `errors`).
- For paginable APIs, include top-level fields:
  - `nextCursor?: string`
  - `prevCursor?: string`
  - `hasMore: boolean`

### `default.ts` (if present)

- Export default constants for queryId/operationName/variables/features.
- Export `buildXxxRequest(input)` that merges defaults + overrides.
- For `api/query/*` APIs with `userId`:
  - resolve `userId` from input first,
  - fallback to self user id from `twid`,
  - throw explicit error only when both are unavailable.

### `index.ts`

- Export callable API function.
- Attach `__desc` to callable.
- `__desc.id` must equal directory name.
- Use `buildGraphqlHeaders(...)` for GraphQL calls.
- Map raw GraphQL payload to normalized response before returning.
- Return shape should include normalized fields plus `__original`.
- For paginable APIs, map cursor fields with this rule:
  - `nextCursor = cursorBottom`
  - `prevCursor = cursorTop`
  - `hasMore = Boolean(nextCursor)`
- Add `__desc.pagination`:
  - `strategy: 'cursor'`
  - `countParam: 'count'`
  - `cursorParam: 'cursor'`
  - `nextCursorField: 'nextCursor'`
  - `prevCursorField: 'prevCursor'`

### `doc.md`

Must include:
1. Purpose / usage scenario.
2. Endpoint and method.
3. Request type and field meanings.
4. Response type and field meanings.
5. Minimal usage and override usage examples.
6. Security/stability notes.
7. Normalized response mapping:
   - Explain each normalized top-level field.
   - Explain that full server payload is available under `__original`.

## API Generation Workflow (AI-driven)

1. Export unknown API records from browser:
   - `window.x.__unknown_api.list()` or
   - `window.x.__unknown_api.toJSON(true)`.
2. Save as JSON input.
   - Input may be a single item JSON.
   - Input may be a list JSON (`XUnknownApiRecord[]`).
3. Determine API id and input profile:
   - Prefer `operationName -> kebab-case` as API id.
   - Determine scope: timeline/read/list style -> `query`; create/update/delete/mutation style -> `action`.
   - If it is timeline/feed/recommendation style, use `passive-default-driven`.
   - If it is user action/detail/create/delete style, use `action-minimal-input`.
4. Generate module files directly under `api/<scope>/<id>/`:

```txt
api/<query|action>/<kebab-id>/
  doc.md
  types.ts
  index.ts
  default.ts   # required when stable defaults exist (usually GraphQL)
```

5. Build `types.ts` with explicit types:
   - `XxxRequest`: public input type.
   - `XxxResolvedRequest`: final payload sent to server (if default merge exists).
   - `XxxOriginalResponse`: explicit raw response contract (as complete as practical).
   - `XxxResponse`: normalized response contract for daily usage.
   - `XxxResponse.__original` must keep full raw payload.
   - Do not use `[key: string]: unknown` as top-level request/response fallback.
6. Build `default.ts`:
   - Keep defaults for endpoint/queryId/operationName/variables/features.
   - Export `buildXxxRequest(input)` and merge in order: defaults -> overrides -> explicit input.
   - For query APIs with `userId`, make `userId` optional and fallback to self user id from `twid`.
7. Build `index.ts`:
   - Export callable API function.
   - Attach `__desc` with complete fields (`id/title/doc/match/requestTypeName/responseTypeName`).
   - Use shared `buildGraphqlHeaders(...)` for GraphQL headers.
   - Convert raw payload to normalized output and keep raw payload in `__original`.
   - If API supports cursor pagination, expose `nextCursor/prevCursor/hasMore` and set `__desc.pagination`.
8. Build `doc.md` as reader-facing documentation:
   - Purpose and scenario.
   - Request method/path/operationName.
   - Request field semantics and default strategy.
   - Response field semantics (core branches + error branches).
   - Minimal usage and override usage examples.
9. Update `api/index.ts` export + registry.
10. Run checks:

```bash
pnpm tsc --noEmit
pnpm test
pnpm build
```

### Generation Contract By Profile

#### `passive-default-driven` (example: `home-latest-timeline`)
- API should support `xxx()` zero-arg call.
- Public input should expose only small convenience fields (e.g. `cursor`, `count`).
- Advanced customization should go through `variablesOverride` / `featuresOverride`.
- Response should expose timeline-friendly top-level fields (for example `tweets`, `entries`, `cursorBottom`) and keep raw response in `__original`.

#### `action-minimal-input` (example: `tweet-detail`)
- Public input must contain minimal required business fields (e.g. `detailId`).
- Protocol-heavy fields stay in `default.ts`.
- Callers may override any default using override objects, with caller value taking priority.
- Response should expose action-relevant top-level fields (for example `tweet`, `author`, `stats`, `viewerState`) and keep raw response in `__original`.

## Pagination Contract

Use this response pattern for cursor-paginable APIs:

```ts
export interface XxxResponse {
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  __original: XxxOriginalResponse;
}
```

Use this descriptor metadata pattern:

```ts
const apiDesc: XApiDesc = {
  // ...
  pagination: {
    strategy: 'cursor',
    countParam: 'count',
    cursorParam: 'cursor',
    nextCursorField: 'nextCursor',
    prevCursorField: 'prevCursor'
  }
};
```

Current APIs supporting `count + cursor` pagination:
1. `home-latest-timeline`
2. `likes`
3. `user-tweets`
4. `user-tweets-and-replies`
5. `follow-list`

`tweet-detail` currently exposes cursors in response but does not yet expose the `count + cursor` request contract, so it is treated as non-standard pagination for now.

## Response Normalization Pattern

Use the following response model when implementing each API:

```ts
export interface XxxOriginalResponse {
  data?: XxxOriginalData;
  errors?: XxxGraphQLError[];
}

export interface XxxResponse {
  // normalized fields for common usage
  tweets?: XxxTweetSummary[];
  users?: XxxUserSummary[];
  cursorTop?: string;
  cursorBottom?: string;
  errors?: XxxGraphQLError[];
  // full server payload
  __original: XxxOriginalResponse;
}
```

Implementation rule:
1. Parse GraphQL JSON to `original`.
2. Extract frequent fields to normalized structure.
3. Return `{ ...normalized, __original: original }`.

## Runtime Registration Contract

`window.x` API registry must follow these rules:
1. Group by scope:
   - `window.x.query.<lowerCamelName>`
   - `window.x.action.<lowerCamelName>`
2. Keep mirrored access under:
   - `window.x.api.query.<lowerCamelName>`
   - `window.x.api.action.<lowerCamelName>`
3. `__desc.id` remains kebab-case and equals directory name (`<kebab-id>`), while runtime key is lowerCamelCase.

## Working With `example-project`

When adding new APIs, inspect:
- `example-project/src/interceptor/*` for capture/replay behavior,
- `example-project/src/api/*` for request payload conventions,
- `example-project/src/types/*` for practical type granularity.

Use those as semantic hints for docs and types in this repository.
