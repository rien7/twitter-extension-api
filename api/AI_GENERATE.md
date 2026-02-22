# AI 生成 API 方案（人工/AI 驱动，非脚本落盘）

本项目的 API 目录由 AI 或开发者直接编写维护。

`scripts/gen-api.ts` 的职责只有一个：
- 读取 `window.x.__unknown_api` 导出的 JSON。
- 输出结构化 **AI Generation Brief**（Markdown）。
- 不直接创建/修改 `api/*` 文件。

## 1. 输入数据来源

输入可以是以下任意结构：

1. `window.x.__unknown_api.list()` 导出的数组。
2. 单条 unknown API item。
3. 包装对象 `{ records: [...] }`。

推荐字段：
- `key`
- `fingerprint`
- `method`
- `path`
- `url`
- `operationName`
- `requestShape`
- `responseShape`
- `requestSample`
- `responseSample`

## 2. 标准工作流

1. 导出 unknown API 记录，保存为 JSON（例如 `json/home-latest-timeline.json`）。
2. 生成 AI brief：

```bash
pnpm gen:api -- --input ./json/home-latest-timeline.json --output ./tmp/home-latest-timeline-brief.md
```

3. 将 brief 提交给 AI，并先判断 scope：
   - read/list/timeline -> `query`
   - create/update/delete/mutation -> `action`
4. 让 AI **直接编写** API 文件。
5. 手动更新 `api/index.ts` 的 export 与注册。
6. 执行质量检查：

```bash
pnpm tsc --noEmit
pnpm test
pnpm build
```

## 3. API 目录结构（query/action 分层 + default.ts 规则）

每个 API 至少包含：

```txt
api/<query|action>/<kebab-name>/
  doc.md
  types.ts
  index.ts
```

当 API 存在稳定默认参数时，必须增加：

```txt
api/<query|action>/<kebab-name>/
  default.ts
```

`default.ts` 用于：
1. 存放默认请求参数（variables/features/queryId/operationName/endpoint）。
2. 提供构造函数（例如 `buildXxxRequest(input)`）将“最小输入”合成为完整请求。

## 4. 参数设计策略（核心）

### 4.1 非用户触发型 API（例如 home-latest-timeline）

这类 API 通常可“开箱即用”，应支持零参数或极少参数调用。

要求：
1. `XxxRequest` 的字段尽量可选（例如 `cursor`、`count`）。
2. 默认值在 `default.ts` 维护。
3. 调用时允许通过 `variablesOverride` / `featuresOverride` 覆盖任意默认值。

### 4.2 用户触发型 API（例如 tweet-detail / create-tweet）

这类 API 需要最小必填参数。

示例：
- `tweet-detail` 至少需要 `detailId`。

要求：
1. 对外请求类型只暴露必要业务参数（如 `detailId`）。
2. 非必要但常变化的系统参数放在 `default.ts`。
3. 支持覆盖字段（如 `variablesOverride` / `featuresOverride` / `headers`）。

### 4.4 `userId` 默认值策略（query API 强制）

对于 `api/query/*` 下需要 `userId` 的 API（例如 `follow-list`、`likes`、`user-tweets`、`user-tweets-and-replies`）：

1. `XxxRequest.userId` 设计为可选。
2. 插件初始化一开始读取 cookie `twid` 并解析 self user id。
3. `twid` 值是 URL-encoded（例如 `u%3D1882474049324081152`），只提取数字部分。
4. `buildXxxRequest(input)` 解析顺序：
   - 先用 `input.userId`（若有）；
   - 否则回退到 self user id；
   - 两者都没有时抛出明确错误。
5. 显式传入 `input.userId` 永远优先于默认值。

### 4.3 输入模式模板（必须遵循）

#### 被动型 API（timeline / recommendation / feed）

`types.ts` 建议形态：

```ts
export interface HomeLatestTimelineRequest {
  cursor?: string;
  count?: number;
  variablesOverride?: Partial<HomeLatestTimelineVariables>;
  featuresOverride?: Partial<HomeLatestTimelineFeatures>;
}
```

`default.ts` 必须提供默认值与构造函数：

```ts
export function buildHomeLatestTimelineRequest(
  input: HomeLatestTimelineRequest = {}
): HomeLatestTimelineResolvedRequest
```

#### 操作型 API（detail / create / delete / like）

`types.ts` 建议形态：

```ts
export interface TweetDetailRequest {
  detailId: string;
  variablesOverride?: Partial<TweetDetailVariables>;
  featuresOverride?: Partial<TweetDetailFeatures>;
}
```

要求：
1. 必填参数只保留业务必要项（例如 `detailId`）。
2. queryId / operationName / 大部分 variables/features 进入 `default.ts`。
3. `buildXxxRequest(input)` 中先应用默认值，再应用用户覆盖值。
4. 用户覆盖优先级最高（显式传入值必须覆盖默认值）。

## 5. 类型质量要求（重点）

禁止仅使用如下占位定义作为最终结果：

```ts
export interface XxxRequest {
  [key: string]: unknown;
}
```

要求：
1. `types.ts` 中尽可能使用明确字段和精确嵌套接口。
2. 为字段补充语义化注释（尤其是变量、cursor、features、timeline instruction）。
3. 对确实动态的区域，优先使用“局部兜底”而不是整对象 `unknown`。
4. 所有类型必须以目录 PascalCase 前缀命名并 `export`。

## 6. 文档质量要求（doc.md + __desc）

`doc.md` 和 `__desc.doc` 是给开发者阅读的，不是占位文本。

至少包含：
1. API 用途与业务场景。
2. 请求方法、路径、operationName。
3. 请求类型结构说明（字段意义、默认值、边界）。
4. 返回类型结构说明（核心字段、可选字段、错误结构）。
5. 调用示例：
   - 最小调用示例。
   - 覆盖默认参数示例。
6. 注意事项（鉴权、速率限制、字段漂移风险）。

## 7. `index.ts` 约束

每个 API 的 `index.ts` 必须：
1. 导出 callable 函数。
2. 函数对象带 `__desc`。
3. GraphQL 请求统一使用共享 header builder（`buildGraphqlHeaders`），不要每个 API 单独硬编码请求头策略。
4. 如存在 `default.ts`，`index.ts` 必须调用其构造函数来生成最终请求。
5. `__desc` 字段完整：
   - `id`
   - `title`
   - `doc`
   - `match`
   - `requestTypeName`
   - `responseTypeName`
6. 对 query API 的 `userId` 字段，`__desc.doc` 必须说明“可选且默认读取 twid 的 self user id”。

## 8. 安全与脱敏

不要将敏感原值写入 `api/*`：
- `authorization`
- `cookie`
- `x-csrf-token`
- `token/secret/password/session` 等敏感字段

可以保留字段名和结构，但值必须是脱敏后的。

## 9. 命名规则

1. 目录名：`kebab-case`，并按能力分层在 `api/query` 或 `api/action` 下。
2. 对外挂载必须分组：
   - `window.x.query.<lowerCamelCase>`
   - `window.x.action.<lowerCamelCase>`
   - 以及镜像 `window.x.api.query.<lowerCamelCase>` / `window.x.api.action.<lowerCamelCase>`
3. `__desc.id` 继续使用目录名（kebab-case）。
4. 类型前缀：目录名的 PascalCase（例如 `home-latest-timeline` -> `HomeLatestTimeline*`）。
5. operationName 优先用于 API 命名。
6. 对 `blocks/friendships` 的 create/destroy 接口，API 命名使用业务语义，不使用协议动词：
   - `friendships/create` -> `follow`
   - `friendships/destroy` -> `unfollow`
   - `blocks/create` -> `block`
   - `blocks/destroy` -> `unblock`

## 10. 输出验收标准

一个 API 合格的最低标准：
1. `doc.md` 可读且完整。
2. `types.ts` 中请求/响应结构足够明确，不是空壳。
3. `default.ts`（若存在）能表达默认参数与合并策略。
4. `index.ts` 的 `__desc` 信息完整且可读。
5. 注册后可通过：

```js
window.x.query.<apiLowerCamel>
window.x.action.<apiLowerCamel>
window.x.api.query.<apiLowerCamel>.__desc
```
