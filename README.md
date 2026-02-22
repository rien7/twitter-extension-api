# Twitter Extension API SDK

A reusable Twitter/X API SDK for browser extensions.

This project focuses on:
1. main-world network interception (`fetch` + `XHR`),
2. unknown API contract capture to `window.x.__unknown_api`,
3. typed, reusable APIs under `window.x.api.query/*` and `window.x.api.action/*`.

## Why this exists

Many extension projects re-implement the same API layer repeatedly.
This repository extracts that layer as a standalone SDK so plugin projects can share:
1. interception,
2. request replay conventions,
3. typed API contracts,
4. pagination helpers.

`example-project` in this repo is a legacy reference for capture/replay behavior.

## Install and build

```bash
pnpm install
pnpm tsc --noEmit
pnpm test
pnpm build
```

## Runtime bootstrap

```ts
import { bootstrapTwitterExtensionApiSdk } from './src';

bootstrapTwitterExtensionApiSdk();
```

After bootstrap:

```js
window.x.__unknown_api.list();
window.x.api.query.homeLatestTimeline.__desc;
window.x.api.query.homeLatestTimeline.__default_params;
window.x.api.query.homeLatestTimeline.__meta;
```

## Global runtime contract

`window.x` provides:
1. `window.x.api.query.<lowerCamelName>`
2. `window.x.api.action.<lowerCamelName>`
3. `window.x.__unknown_api`
4. `window.x.paginateCursorApi`
5. `window.x.collectCursorPages`
6. `window.x.selfUserId` (if resolved from cookie `twid`)

Important:
1. APIs are grouped under `window.x.api`.
2. `window.x.query` / `window.x.action` are not exposed.

## API callable metadata

Each callable API function has:
1. `__desc: string`
   - short plain-text quick help for normal users.
   - reading `api.__desc` auto prints the description via `console.log`.
2. `__default_params?: object`
   - safe default request snapshot (when `default.ts` exists).
3. `__meta: object`
   - machine metadata for known-API matching and pagination.

Example:

```js
const api = window.x.api.query.likes;

console.log(api.__desc);
console.log(api.__default_params);
console.log(api.__meta.match);
```

## Request defaults and userId fallback

For query APIs that require `userId` (for example `likes`, `userTweets`, `followList`):
1. `input.userId` is optional.
2. SDK reads cookie `twid` during bootstrap.
3. `twid` is URL-encoded (`u%3D42`); only the numeric id is used.
4. Priority is:
   - explicit `input.userId`
   - fallback self user id
   - otherwise throw clear error.

## Pagination helpers

Cursor APIs expose `nextCursor`, `prevCursor`, `hasMore` and can be consumed with helpers:

```js
const firstPage = await window.x.api.query.likes({ count: 20 });

const collected = await window.x.collectCursorPages(
  window.x.api.query.likes,
  { count: 20 },
  {
    maxPages: 3,
    extractItems: (page) => page.tweets ?? []
  }
);
```

## API directory layout

All APIs must follow:

```txt
api/<query|action>/<kebab-id>/
  doc.md
  types.ts
  desc.ts
  fetch.ts
  normalize.ts
  index.ts
  default.ts        # required when stable defaults exist
```

## Adding a new API

1. Export unknown records:

```js
window.x.__unknown_api.list();
```

2. Implement API files manually under `api/<scope>/<id>/` with required structure.
3. Register exports in `api/index.ts`.
4. Run validation:

```bash
pnpm tsc --noEmit
pnpm test
pnpm build
```

## Quality baseline

1. Top-level request/response types must be explicit.
2. `__desc` must be concise plain text.
3. `doc.md` must be detailed (field meanings, errors, examples).
4. Keep full original payload under `__original`.
5. Never persist sensitive values (auth/cookie/csrf/token secrets).

## Key documents

1. `AGENTS.md` — contributor + AI execution rules.
2. `api/AI_GENERATE.md` — API generation policy.
