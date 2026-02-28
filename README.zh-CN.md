# Twitter Extension API SDK（中文）

English version: [README.md](./README.md)

这是一个运行在 `x.com / twitter.com` 页面上下文的可复用 SDK，核心目标是统一：
- 主世界网络拦截，
- 未知 API 发现，
- 可调用 API 封装，
- 分页辅助能力。

## 这个库做什么

1. 提供内置 API：
- `window.x.api.query.*`
- `window.x.api.action.*`

2. 为每个 API 提供元数据：
- `__desc`（人类可读说明）
- `__default_params`（默认参数快照）
- `__meta`（匹配与分页元数据）

3. 提供分页辅助：
- `window.x.paginateCursorApi`
- `window.x.collectCursorPages`

4. 可选记录未知接口：
- `window.x.__unknown_api`

## 适用边界

1. 仅浏览器运行时
- 依赖 `window`、`document`、cookie、页面会话上下文。

2. 目标站点
- 仅建议在 `https://x.com/*`、`https://twitter.com/*` 页面使用。

3. 依赖登录态
- 大多数 API 依赖当前页面登录会话。

4. 非官方稳定 API
- `queryId`、返回字段、特性开关会随 X 前端变更。

5. 不提供绕风控能力
- 不承诺绕过验证码、反爬或平台策略。

6. 媒体上传边界
- `uploadImage` 当前面向图片上传（`tweet_image`），不包含视频/GIF 的异步处理轮询流程。

## XHR/fetch 拦截行为

拦截由 `bootstrapTwitterExtensionApiSdk({ enableUnknownApiCapture })` 控制。

### 情况 A：`enableUnknownApiCapture: true`

会发生：
- 安装页面主世界 `fetch/XHR` 拦截。
- 把未知 API 记录到 `window.x.__unknown_api`。
- 从真实页面流量更新 GraphQL 头模板。

结果：
- 可使用未知 API 发现能力（`list()`、`toJSON()`），回放请求与页面真实行为更接近。

### 情况 B：省略或 `enableUnknownApiCapture: false`（默认）

会发生：
- 不安装 `fetch/XHR` 拦截。
- `window.x.__unknown_api` 存在，但不会自动记录流量。

结果：
- 内置 API 可正常调用。
- 不会被动采集未知 API 记录。

## unknown_api 记录默认关闭

默认不采集未知 API：

```ts
import { bootstrapTwitterExtensionApiSdk } from 'twitter-extension-api-sdk';

bootstrapTwitterExtensionApiSdk(); // 默认不记录 unknown_api
```

手动开启采集：

```ts
import { bootstrapTwitterExtensionApiSdk } from 'twitter-extension-api-sdk';

bootstrapTwitterExtensionApiSdk({
  enableUnknownApiCapture: true
});
```

## 安装与构建

```bash
pnpm install
pnpm tsc --noEmit
pnpm test
pnpm build
```

## 使用方式

### 1) npm 作为第三方库

安装：

```bash
npm i twitter-extension-api-sdk
```

基础用法：

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

扩展推荐（WXT + MAIN world）：

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

### 2) CDN 使用

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

IIFE 全局变量：`TwitterExtensionApiSdk`。

### 3) Tampermonkey 使用

重点：Tampermonkey 沙箱与页面主世界隔离。应先注入到页面主世界再 bootstrap。

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

### 4) 控制台使用

若页面已注入 SDK：

```js
window.x.api.query.homeLatestTimeline({ count: 20 });
window.x.api.action.favoriteTweet({ tweetId: '42' });
```

若页面未注入 SDK：

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

## 最小实战

### 场景 A：搜索 -> 点赞 -> 取消点赞 -> 翻页

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
  throw new Error('没有找到可操作 tweetId');
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

  console.log('second page tweets:', second.tweets.length);
}
```

### 场景 B：上传图片 -> 发推

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
    else reject(new Error('未选择文件'));
  };
});

const uploaded = await window.x.api.action.uploadImage({
  file
});

if (!uploaded.mediaId) {
  throw new Error('uploadImage 未返回 mediaId');
}

const tweet = await window.x.api.action.createTweet({
  tweetText: '来自 SDK 的图片推文',
  mediaIds: [uploaded.mediaId]
});

console.log(tweet.success, tweet.resultTweet?.tweetId);
```

## 内置 API 清单

### Query APIs

| API | 调用入口 | 必填参数 | 说明 |
|---|---|---|---|
| `bookmarks` | `window.x.api.query.bookmarks(input?)` | 无 | 当前账号书签时间线 |
| `followList` | `window.x.api.query.followList(input?)` | 无（`userId` 可回退 `twid`） | 用户关注列表 |
| `followersYouFollow` | `window.x.api.query.followersYouFollow(input?)` | 无（`userId` 可回退 `twid`） | 你关注且也关注目标用户的人 |
| `homeLatestTimeline` | `window.x.api.query.homeLatestTimeline(input?)` | 无 | 首页最新时间线 |
| `likes` | `window.x.api.query.likes(input?)` | 无（`userId` 可回退 `twid`） | 用户点赞时间线 |
| `notificationsTimeline` | `window.x.api.query.notificationsTimeline(input?)` | 无 | 通知时间线 |
| `searchTimeline` | `window.x.api.query.searchTimeline(input)` | `rawQuery` | 搜索（Top/Latest/People/Media/Lists） |
| `tweetDetail` | `window.x.api.query.tweetDetail(input)` | `detailId` | 推文详情线程 |
| `userByScreenName` | `window.x.api.query.userByScreenName(input)` | `screenName` | 按用户名查询资料 |
| `userTweets` | `window.x.api.query.userTweets(input?)` | 无（`userId` 可回退 `twid`） | 用户推文时间线 |
| `userTweetsAndReplies` | `window.x.api.query.userTweetsAndReplies(input?)` | 无（`userId` 可回退 `twid`） | 用户推文+回复时间线 |

### Action APIs

| API | 调用入口 | 必填参数 | 说明 |
|---|---|---|---|
| `block` | `window.x.api.action.block(input)` | `userId` | 拉黑用户 |
| `createBookmark` | `window.x.api.action.createBookmark(input)` | `tweetId` | 添加书签 |
| `createRetweet` | `window.x.api.action.createRetweet(input)` | `tweetId` | 转推 |
| `createTweet` | `window.x.api.action.createTweet(input)` | `tweetText` | 发推（普通/回复/引用） |
| `uploadImage` | `window.x.api.action.uploadImage(input)` | `file` | 上传图片并返回 `mediaId` |
| `deleteBookmark` | `window.x.api.action.deleteBookmark(input)` | `tweetId` | 删除书签 |
| `deleteRetweet` | `window.x.api.action.deleteRetweet(input)` | `tweetId` | 取消转推 |
| `deleteTweet` | `window.x.api.action.deleteTweet(input)` | `tweetId` | 删除推文 |
| `favoriteTweet` | `window.x.api.action.favoriteTweet(input)` | `tweetId` | 点赞 |
| `follow` | `window.x.api.action.follow(input)` | `userId` | 关注 |
| `grokTranslation` | `window.x.api.action.grokTranslation(input)` | `tweetId` | Grok 翻译 |
| `removeFollower` | `window.x.api.action.removeFollower(input)` | `targetUserId` | 移除粉丝 |
| `unblock` | `window.x.api.action.unblock(input)` | `userId` | 解除拉黑 |
| `unfavoriteTweet` | `window.x.api.action.unfavoriteTweet(input)` | `tweetId` | 取消点赞 |
| `unfollow` | `window.x.api.action.unfollow(input)` | `userId` | 取消关注 |

## 元数据与调试

```js
const api = window.x.api.query.searchTimeline;

api.__desc; // 访问时自动 console.log
console.log(api.__default_params);
console.log(api.__meta);
```

## unknown API 记录查看

```js
window.x.__unknown_api.list();
window.x.__unknown_api.toJSON(true);
```

## 仓库关键文档

1. `AGENTS.md` - 实现约束。
2. `api/AI_GENERATE.md` - API 生成规范。
