# Twitter Extension API SDK

A standalone SDK for Chrome/Firefox extensions that need to interact with Twitter/X APIs without re-implementing low-level interception and request replay in every project.

## Why this repo exists

In many Twitter extension projects, API logic is mixed with UI/business code.
This repository extracts the reusable API layer into a dedicated package:

1. intercept requests from page context,
2. capture unknown API contracts,
3. maintain reusable typed API modules under `api/*`.

`example-project` (symlinked in this repo) is the previous integrated project and serves as behavior reference.

## Core capabilities

- Main-world interception of `fetch` and `XMLHttpRequest`.
- GraphQL-focused request classification (`operationName`, path, shape hash).
- Unknown request registry at `window.x.__unknown_api`.
- Callable API registry at `window.x.query.<lowerCamelName>` / `window.x.action.<lowerCamelName>`
  (mirrored at `window.x.api.query.<lowerCamelName>` / `window.x.api.action.<lowerCamelName>`).
- Unified GraphQL request header builder (authorization/csrf/language/x-twitter defaults).
- Default-parameter strategy (`default.ts`) for APIs that do not require user input.
- Minimal-input API design for user-action APIs with override support.
- NPM library build outputs (ESM + IIFE).
- WXT extension build for runtime injection.

## Repository structure

```txt
twitter-extension-api/
  entrypoints/        # WXT entrypoints (content/main world)
  src/                # interception + runtime core
  api/                # human/AI maintained API modules
  scripts/            # tooling (AI brief generator only)
  tests/              # shape/fingerprint/store tests
  example-project ->  # reference project with older integrated implementation
```

## Quick start

```bash
pnpm install
pnpm tsc --noEmit
pnpm test
pnpm build
```

## Runtime usage

The content script initializes SDK in page main world.

```ts
import { bootstrapTwitterExtensionApiSdk } from './src';

bootstrapTwitterExtensionApiSdk();
```

After initialization:

```js
window.x.__unknown_api.list();
window.x.query.homeLatestTimeline.__desc;
window.x.action.deleteTweet.__desc;
```

## API design pattern

### Pattern A: passive timeline-like API (default-driven)

For APIs like `home-latest-timeline`, callers should be able to pass nothing or only a few overrides.
Defaults live in `default.ts`.

```ts
import { homeLatestTimeline } from './api/query/home-latest-timeline';

// zero-arg call, fully defaulted
const firstPage = await homeLatestTimeline();

// override only what you need
const nextPage = await homeLatestTimeline({
  cursor: 'cursor-bottom-token',
  count: 40,
  featuresOverride: {
    articles_preview_enabled: false
  }
});
```

### Pattern B: user-action API (minimal required input)

For APIs like `tweet-detail`, expose only required business params (for example `detailId`) and keep protocol-heavy defaults in `default.ts`.

```ts
// Example shape (not implemented in this repo yet)
// tweetDetail({ detailId: '123' })
// tweetDetail({ detailId: '123', variablesOverride: { withVoice: false } })
```

## API module file layout

Base files:

```txt
api/<query|action>/<kebab-id>/
  doc.md
  types.ts
  index.ts
```

Add `default.ts` when stable default params exist:

```txt
api/<query|action>/<kebab-id>/
  default.ts
```

## Adding a new API (AI-first workflow)

Important: this repo does **not** use script-based source generation for `api/*`.

### Step 1: export unknown record

From browser console:

```js
window.x.__unknown_api.list();
```

Save result to a json file.

### Step 2: generate AI brief

```bash
pnpm gen:api -- --input ./json/unknown-api.json --output ./tmp/unknown-api-brief.md
```

This command only outputs analysis/brief content. It does not create API files.

### Step 3: let AI write API module files

Create/update manually (via AI assistance):

```txt
api/<query|action>/<kebab-id>/
  doc.md
  types.ts
  index.ts
  default.ts   # when defaults are needed
```

### Step 4: register API

Update `api/index.ts` to export and register under query/action groups using lowerCamelCase keys.

### Step 5: validate

```bash
pnpm tsc --noEmit
pnpm test
pnpm build
```

## Quality bar for generated APIs

1. `types.ts` must prefer explicit interfaces, not all-`unknown` placeholders.
2. `doc.md` and `__desc.doc` must explain field semantics clearly.
3. For passive APIs, default params must be centralized in `default.ts`.
4. For action APIs, public request input should be minimal + override-friendly.
5. Sensitive values must remain redacted.

## Relationship with example-project

Use `example-project` to understand legacy implementation details:
- XHR intercept/replay mechanics,
- GraphQL feature flags,
- timeline/tweet response handling.

This repo should keep those behaviors but expose them as reusable API modules independent of UI.

## Key docs

- `AGENTS.md` — contributor and AI agent execution rules.
- `api/AI_GENERATE.md` — detailed AI generation policy and acceptance criteria.
