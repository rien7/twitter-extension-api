# Twitter Extension API SDK

Chinese version: [README.zh-CN.md](./README.zh-CN.md)

A reusable SDK for `x.com / twitter.com` page context that standardizes:
- page-world network interception,
- unknown API discovery,
- typed query/action wrappers,
- cursor pagination helpers.

## What this library does

1. Exposes built-in APIs under:
- `window.x.api.query.*`
- `window.x.api.action.*`

2. Provides metadata on every callable API:
- `__desc` (human-readable quick help)
- `__default_params` (safe defaults snapshot)
- `__meta` (matching + pagination metadata)

3. Provides pagination helpers:
- `window.x.paginateCursorApi`
- `window.x.collectCursorPages`

4. Optionally captures unknown traffic into:
- `window.x.__unknown_api`

## Scope and boundaries

1. Browser-only runtime
- Requires `window`, `document`, cookies, and page session context.

2. Target domains
- Intended for `https://x.com/*` and `https://twitter.com/*`.

3. Session dependent
- Most APIs require logged-in page session state.

4. Not an official stable API
- `queryId`, fields, and feature switches can change.

5. No anti-bot bypass guarantees
- This project does not bypass CAPTCHA, anti-bot checks, or platform policy controls.

6. Media upload scope
- `uploadImage` is designed for image upload (`tweet_image`) and does not include video/gif async processing polling.

## XHR/fetch interception behavior

Interception is controlled by `bootstrapTwitterExtensionApiSdk({ enableUnknownApiCapture })`.

### Case A: `enableUnknownApiCapture: true`

What happens:
- Installs fetch/XHR interceptors in page world.
- Captures unknown API records into `window.x.__unknown_api`.
- Stores latest GraphQL request header templates from real page traffic.

Result:
- You can use unknown API discovery (`list()`, `toJSON()`), and replay behavior is closer to real page requests.

### Case B: omitted or `enableUnknownApiCapture: false` (default)

What happens:
- No fetch/XHR interception is installed.
- `window.x.__unknown_api` exists but will not auto-record traffic.

Result:
- Built-in APIs still work as normal wrappers.
- No passive unknown API capture from page traffic.

## Unknown API capture is OFF by default

Default bootstrap does not capture unknown APIs:

```ts
import { bootstrapTwitterExtensionApiSdk } from 'twitter-extension-api-sdk';

bootstrapTwitterExtensionApiSdk(); // capture disabled by default
```

Enable capture explicitly:

```ts
import { bootstrapTwitterExtensionApiSdk } from 'twitter-extension-api-sdk';

bootstrapTwitterExtensionApiSdk({
  enableUnknownApiCapture: true
});
```

## Install and build

```bash
pnpm install
pnpm tsc --noEmit
pnpm test
pnpm build
```

## Usage options

### 1) As a third-party npm library

Install:

```bash
npm i twitter-extension-api-sdk
```

Basic usage:

```ts
import { bootstrapTwitterExtensionApiSdk } from 'twitter-extension-api-sdk';

bootstrapTwitterExtensionApiSdk();

const page = await window.x.api.query.searchTimeline({
  rawQuery: 'hello world',
  product: 'Latest',
  count: 20
});

console.log(page.tweets, page.nextCursor);
```

Recommended extension setup (WXT, MAIN world):

```ts
import { defineContentScript } from 'wxt/utils/define-content-script';
import { bootstrapTwitterExtensionApiSdk } from 'twitter-extension-api-sdk';

export default defineContentScript({
  matches: ['*://x.com/*', '*://twitter.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    bootstrapTwitterExtensionApiSdk({
      enableUnknownApiCapture: true
    });
  }
});
```

### 2) Via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/twitter-extension-api-sdk@0.1.0/dist/index.global.js"></script>
<script>
  TwitterExtensionApiSdk.bootstrapTwitterExtensionApiSdk();

  window.x.api.query.searchTimeline({
    rawQuery: 'hello world',
    product: 'Top',
    count: 20
  }).then(console.log);
</script>
```

IIFE global: `TwitterExtensionApiSdk`.

### 3) In Tampermonkey

Important: Tampermonkey sandbox is isolated from page main world. Inject into page world first.

```javascript
// ==UserScript==
// @name         X API SDK Bootstrap
// @namespace    local
// @version      1.0.0
// @match        https://x.com/*
// @match        https://twitter.com/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  const sdkUrl = 'https://cdn.jsdelivr.net/npm/twitter-extension-api-sdk@0.1.0/dist/index.global.js';

  const sdkScript = document.createElement('script');
  sdkScript.src = sdkUrl;
  sdkScript.onload = () => {
    const boot = document.createElement('script');
    boot.textContent = `
      window.TwitterExtensionApiSdk.bootstrapTwitterExtensionApiSdk({
        enableUnknownApiCapture: true
      });
    `;
    document.documentElement.appendChild(boot);
    boot.remove();
  };

  document.documentElement.appendChild(sdkScript);
})();
```

### 4) From browser console

If SDK is already present:

```js
window.x.api.query.homeLatestTimeline({ count: 20 });
window.x.api.action.favoriteTweet({ tweetId: '42' });
```

If SDK is not present yet:

```js
await new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/twitter-extension-api-sdk@0.1.0/dist/index.global.js';
  s.onload = resolve;
  s.onerror = reject;
  document.documentElement.appendChild(s);
});

TwitterExtensionApiSdk.bootstrapTwitterExtensionApiSdk({
  enableUnknownApiCapture: true
});
```

## Minimal end-to-end practical flows

### Flow A: Search -> favorite -> unfavorite -> paginate

```js
if (!window.x?.api?.query?.searchTimeline) {
  TwitterExtensionApiSdk.bootstrapTwitterExtensionApiSdk();
}

const first = await window.x.api.query.searchTimeline({
  rawQuery: 'hello world',
  product: 'Latest',
  count: 20
});

const firstTweetId = first.tweets?.[0]?.tweetId;
if (!firstTweetId) {
  throw new Error('No tweetId found in first page');
}

await window.x.api.action.favoriteTweet({ tweetId: firstTweetId });
await window.x.api.action.unfavoriteTweet({ tweetId: firstTweetId });

if (first.nextCursor) {
  const second = await window.x.api.query.searchTimeline({
    rawQuery: 'hello world',
    product: 'Latest',
    count: 20,
    cursor: first.nextCursor
  });

  console.log('second page tweet count:', second.tweets.length);
}
```

### Flow B: Upload image -> create tweet

```js
if (!window.x?.api?.action?.uploadImage) {
  TwitterExtensionApiSdk.bootstrapTwitterExtensionApiSdk();
}

const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.click();

const file = await new Promise((resolve, reject) => {
  input.onchange = () => {
    const selected = input.files?.[0];
    if (selected) resolve(selected);
    else reject(new Error('No file selected'));
  };
});

const uploaded = await window.x.api.action.uploadImage({
  file
});

if (!uploaded.mediaId) {
  throw new Error('uploadImage did not return mediaId');
}

const tweet = await window.x.api.action.createTweet({
  tweetText: 'Image tweet from SDK',
  mediaIds: [uploaded.mediaId]
});

console.log(tweet.success, tweet.resultTweet?.tweetId);
```

## Built-in API catalog

### Query APIs

| API | Entry point | Required input | Purpose |
|---|---|---|---|
| `bookmarks` | `window.x.api.query.bookmarks(input?)` | none | current-account bookmark timeline |
| `followList` | `window.x.api.query.followList(input?)` | none (`userId` falls back to `twid`) | following list for a user |
| `followersYouFollow` | `window.x.api.query.followersYouFollow(input?)` | none (`userId` falls back to `twid`) | overlap users you follow who follow target |
| `homeLatestTimeline` | `window.x.api.query.homeLatestTimeline(input?)` | none | home latest timeline |
| `likes` | `window.x.api.query.likes(input?)` | none (`userId` falls back to `twid`) | liked tweets timeline |
| `notificationsTimeline` | `window.x.api.query.notificationsTimeline(input?)` | none | notifications timeline |
| `searchTimeline` | `window.x.api.query.searchTimeline(input)` | `rawQuery` | search across Top/Latest/People/Media/Lists |
| `tweetDetail` | `window.x.api.query.tweetDetail(input)` | `detailId` | tweet detail thread |
| `userByScreenName` | `window.x.api.query.userByScreenName(input)` | `screenName` | profile by screen name |
| `userTweets` | `window.x.api.query.userTweets(input?)` | none (`userId` falls back to `twid`) | user tweet timeline |
| `userTweetsAndReplies` | `window.x.api.query.userTweetsAndReplies(input?)` | none (`userId` falls back to `twid`) | user tweet+reply timeline |

### Action APIs

| API | Entry point | Required input | Purpose |
|---|---|---|---|
| `block` | `window.x.api.action.block(input)` | `userId` | block user |
| `createBookmark` | `window.x.api.action.createBookmark(input)` | `tweetId` | add bookmark |
| `createRetweet` | `window.x.api.action.createRetweet(input)` | `tweetId` | retweet |
| `createTweet` | `window.x.api.action.createTweet(input)` | `tweetText` | create tweet (direct/reply/quote) |
| `uploadImage` | `window.x.api.action.uploadImage(input)` | `file` | upload image and return `mediaId` |
| `deleteBookmark` | `window.x.api.action.deleteBookmark(input)` | `tweetId` | remove bookmark |
| `deleteRetweet` | `window.x.api.action.deleteRetweet(input)` | `tweetId` | undo retweet |
| `deleteTweet` | `window.x.api.action.deleteTweet(input)` | `tweetId` | delete tweet |
| `favoriteTweet` | `window.x.api.action.favoriteTweet(input)` | `tweetId` | like tweet |
| `follow` | `window.x.api.action.follow(input)` | `userId` | follow user |
| `grokTranslation` | `window.x.api.action.grokTranslation(input)` | `tweetId` | Grok translation |
| `removeFollower` | `window.x.api.action.removeFollower(input)` | `targetUserId` | remove follower |
| `unblock` | `window.x.api.action.unblock(input)` | `userId` | unblock user |
| `unfavoriteTweet` | `window.x.api.action.unfavoriteTweet(input)` | `tweetId` | unlike tweet |
| `unfollow` | `window.x.api.action.unfollow(input)` | `userId` | unfollow user |

## Metadata and debugging

```js
const api = window.x.api.query.searchTimeline;

api.__desc; // auto prints via console.log
console.log(api.__default_params);
console.log(api.__meta);
```

## Unknown API store usage

```js
window.x.__unknown_api.list();
window.x.__unknown_api.toJSON(true);
```

## Key repo docs

1. `AGENTS.md` - contributor and implementation constraints.
2. `api/AI_GENERATE.md` - API generation policy.
