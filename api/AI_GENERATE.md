# API 生成规范（AI/人工直写，非脚本落盘）

本文件定义如何根据 `window.x.__unknown_api` 记录生成 `api/*` 代码。

## 0. 总原则

1. 直接编写 `api/*` 源码，不使用脚本自动写文件。
2. `__desc` 只做“快速说明”，必须是纯文本字符串，不能是对象。
3. `doc.md` 做“详细说明”，包含字段级语义、错误、示例。
4. 机器匹配/分页所需信息放到 `__meta`，不要混进 `__desc`。
5. 存在默认参数时必须提供 `__default_params`。
6. 不做旧结构兼容：禁止生成旧式对象型 `__desc` 或 fallback 分支。
7. 所有 tweetId 类示例值统一使用 `42`（包含 `tweetId` / `tweet_id` / `source_tweet_id` / `focalTweetId` 等）。
8. 示例必须保留字段名，不允许只写裸值（例如禁止 `{ '42' }`）。

## 1. 输入来源

输入可以是以下任意一种：
1. `window.x.__unknown_api.list()` 导出的数组 JSON。
2. 单条 unknown API item JSON。
3. 包装对象 `{ records: [...] }`。

推荐使用字段：
- `method`
- `path`
- `url`
- `operationName`
- `requestShape`
- `responseShape`
- `requestSample`
- `responseSample`
- `fingerprint`

## 2. 作用域与命名

1. `read/list/timeline/feed` -> `api/query/<kebab-id>`
2. `create/update/delete/mutation` -> `api/action/<kebab-id>`
3. `kebab-id` 优先从 `operationName` 转换。
4. 外部调用名使用 `lowerCamelCase`，注册到：
   - `window.x.api.query.<lowerCamelCase>`
   - `window.x.api.action.<lowerCamelCase>`

## 3. 目录结构

每个 API 必须使用以下结构：

```txt
api/<query|action>/<kebab-id>/
  doc.md
  types.ts
  desc.ts
  fetch.ts
  normalize.ts
  index.ts
  default.ts           # 存在稳定默认参数时必须有
```

说明：
1. `index.ts` 只做组装与导出，保持简洁。
2. `fetch.ts` 只做请求发送与协议错误处理。
3. `normalize.ts` 只做响应归一化。
4. `desc.ts` 负责 `__desc`、`__default_params`、`__meta`。
5. 不允许把 transport/normalize 逻辑回塞到 `index.ts`。

## 4. 类型生成要求（types.ts）

必须导出完整类型，并尽量明确字段语义。

建议最少包含：
1. `XxxRequest`：对外输入。
2. `XxxResolvedRequest`：默认参数合并后的实际请求。
3. `XxxOriginalResponse`：原始响应结构（尽可能具体）。
4. `XxxResponse`：归一化响应结构。

强约束：
1. 类型名前缀必须是目录名 PascalCase（如 `home-latest-timeline` -> `HomeLatestTimeline*`）。
2. 顶层请求/响应禁止用 `[key: string]: unknown` 作为最终定义。
3. 完整响应必须保留在 `XxxResponse.__original`。
4. 高频使用字段要提升到顶层（可保留适度层级）。

## 5. 默认参数策略（default.ts）

当 API 有稳定默认参数时，必须提供：
1. `DEFAULT_*` 常量（endpoint/queryId/operationName/variables/features/fieldToggles）。
2. `buildXxxRequest(input = {})`。

合并优先级：
1. 默认值
2. override 对象
3. 显式输入字段（优先级最高）

### 5.1 query API 的 `userId` 默认值（强制）

对于 `api/query/*` 且请求依赖 `userId` 的 API：
1. `XxxRequest.userId` 设为可选。
2. 默认从 cookie `twid` 解析 self user id。
3. `twid` 为 URL-encoded（例如 `u%3D42`），只提取数字部分。
4. 解析顺序：
   - 优先 `input.userId`
   - 否则 self user id
   - 都没有时抛明确错误

## 6. 描述与元信息（desc.ts）

`desc.ts` 必须导出：
1. `XXX_DESC_TEXT: string`（纯文本）
2. `XXX_DEFAULT_PARAMS`（若有默认参数）
3. `XXX_META`（机器使用）

### 6.1 `__desc`（纯文本速览）

要求：
1. 面向普通用户，快速看懂用途和调用方式。
2. 只写简洁文本，不写冗长细节。
3. 访问 `api.__desc` 时应自动通过 `console.log` 打印内容（`__desc` 仍是字符串值）。
4. 建议包含：
   - API 作用
   - 调用方式
   - `Input:` 分组
   - `Required:` 子项（缩进）
   - `Optional:` 子项（缩进）
   - 分页方式（如有）
   - 返回关键字段

推荐模板：

```txt
[likes]
Purpose: Fetch liked tweets of a user.
Call: window.x.api.query.likes(input?)
Required: none (userId defaults to self from twid)
Optional: userId, count, cursor, variablesOverride, featuresOverride, fieldTogglesOverride
Pagination: count + cursor -> nextCursor / prevCursor / hasMore
Returns: tweets, conversationTweetIds, nextCursor, hasMore, errors
```

### 6.2 `__default_params`

要求：
1. 用于让调用者快速查看默认请求参数。
2. 只能包含可公开的默认值。
3. 不得包含敏感字段值（token/cookie/csrf/authorization）。

### 6.3 `__meta`

`__meta` 必须包含机器运行所需信息：
1. `id`
2. `title`
3. `match`（method/path/operationName/variablesShapeHash）
4. `requestTypeName`
5. `responseTypeName`
6. `pagination`（若支持）

注意：known API 去重与分页自动化基于 `__meta`，不是 `__desc`。

## 6.4 unknown_api fingerprint 的 tweetId 脱敏（强制）

在生成 GraphQL unknown_api fingerprint 时：
1. 先对变量中的 tweetId 类字段值做归一化（统一为 `42`）。
2. 再计算 `variablesShapeHash`。
3. 目标：同一 operation 不因 tweetId 不同而产生多条无法合并的 unknown 记录。

## 7. 请求发送层（fetch.ts）

1. GraphQL 请求必须使用共享 header 逻辑：`buildGraphqlHeaders(...)`。
2. 统一处理：
   - 非 JSON 返回
   - HTTP 非 2xx
   - GraphQL errors 分支
3. 返回值建议是已解析的 `XxxOriginalResponse`。

## 8. 归一化层（normalize.ts）

1. 从深层 GraphQL 响应中提取常用字段到顶层。
2. 保留完整原始响应到 `__original`。
3. 可分页 API 必须输出：
   - `nextCursor?: string`
   - `prevCursor?: string`
   - `hasMore: boolean`

## 9. 导出层（index.ts）与 JSDoc

`index.ts` 必须：
1. 导出 callable API 函数。
2. 给函数对象挂载：
   - `__desc`（纯文本）
   - `__default_params`（如有）
   - `__meta`
3. 在函数定义上方添加 JSDoc，至少包含：
   - `@summary`
   - `@param`
   - `@returns`
   - `@example`

示例：

```ts
/**
 * @summary Fetch liked tweets for a user.
 * @param input Optional request overrides. If userId is omitted, uses self user id from twid.
 * @returns Normalized likes timeline with __original payload.
 * @example
 * const res = await window.x.api.query.likes({ count: 20 });
 */
export async function likes(input: LikesRequest = {}): Promise<LikesResponse> {
  // ...
}
```

## 10. `doc.md` 详细文档要求

`doc.md` 必须用于深度阅读，至少包括：
1. API 作用与场景。
2. endpoint/method/operationName。
3. 请求字段说明（含默认值和优先级）。
4. 响应字段说明（含提取来源和意义）。
5. 错误说明（网络错误、GraphQL 错误、参数错误）。
6. 最小调用示例。
7. 覆盖默认参数示例。
8. 分页示例（如适用）。
9. 稳定性与安全说明。

## 11. 安全与脱敏

禁止把以下真实值写入 `api/*`：
1. `authorization`
2. `cookie`
3. `x-csrf-token`
4. 任何 token/secret/password/session 实值

可以保留字段名和结构，值必须脱敏。

## 12. 验收命令

生成或修改 API 后必须执行：

```bash
pnpm tsc --noEmit
pnpm test
pnpm build
```
