# search-timeline

## Purpose
Fetch search results from X SearchTimeline GraphQL and normalize common fields.

This API is suitable for:
- running search queries with product tabs (`Top`, `Latest`, `People`, `Media`, `Lists`),
- loading more results with cursor pagination,
- consuming normalized tweet/user/list summaries while keeping raw payload.

## Endpoint
- Method: `GET`
- Path pattern: `/i/api/graphql/*/SearchTimeline`
- OperationName: `SearchTimeline`

## Request Type
Type name: `SearchTimelineRequest`

### Required field
- `rawQuery`: Search query text.

### Optional fields
- `product`: Search tab (`Top` | `Latest` | `People` | `Media` | `Lists`).
- `count`: Page size override.
- `cursor`: Pagination cursor.
- `querySource`: Source marker (default `typed_query`).
- `withGrokTranslatedBio`: Override translated-bio request flag.
- `variablesOverride`: Partial override for GraphQL variables.
- `featuresOverride`: Partial override for GraphQL feature switches.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.
- `endpoint` / `queryId` / `operationName`: Optional protocol overrides.

### Default precedence
`buildSearchTimelineRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `variablesOverride` / `featuresOverride`,
3. explicit convenience fields (`rawQuery`, `product`, `count`, `cursor`, `querySource`, `withGrokTranslatedBio`).

## Response Type
Type name: `SearchTimelineResponse`

### Normalized top-level fields
- `query`: Effective `rawQuery` used in request.
- `product`: Effective product/tab used in request.
- `querySource`: Effective query source used in request.
- `instructions`: Raw timeline instructions.
- `entries`: Flattened timeline entries from add/replace instructions.
- `tweets`: Normalized tweet summaries (`XTweetSummary`).
- `users`: Normalized user summaries (`XUserSummary`).
- `lists`: Normalized list summaries.
- `cursorTop` / `cursorBottom`: Raw cursor aliases.
- `nextCursor` / `prevCursor` / `hasMore`: Standardized pagination fields.
- `conversationTweetIds`: Aggregated tweet ids from timeline metadata and extracted tweets.
- `errors`: GraphQL error array (if provided).
- `__original`: Full parsed GraphQL payload.

### Key extracted summary fields
- `tweets[].stats.viewCount` carries view count.
- `tweets[].quotedTweet` carries quoted tweet linkage summary.
- `users[].relationship` carries relationship booleans.
- `lists[].owner` is normalized `XUserSummary` for list owner.

## Error model and edge cases
- Throws when HTTP status is non-2xx.
- Throws when response is not valid JSON.
- Preserves GraphQL `errors` in normalized response when server returns them.
- Some products (such as `Lists`) may return non-empty `errors` with partial timeline data; normalized output still keeps parsed data under `entries`/`lists` and full payload in `__original`.

## Minimal usage example

```ts
import { searchTimeline } from '../api';

const page = await searchTimeline({
  rawQuery: 'hello world'
});
```

## Override/default-params example

```ts
import { searchTimeline } from '../api';

const page = await searchTimeline({
  rawQuery: 'hello world',
  product: 'People',
  count: 40,
  variablesOverride: {
    querySource: 'typed_query'
  },
  featuresOverride: {
    articles_preview_enabled: false
  }
});
```

## Pagination example

```ts
import { searchTimeline } from '../api';

const firstPage = await searchTimeline({
  rawQuery: 'hello world',
  product: 'Latest',
  count: 20
});

if (firstPage.nextCursor) {
  const secondPage = await searchTimeline({
    rawQuery: 'hello world',
    product: 'Latest',
    count: 20,
    cursor: firstPage.nextCursor
  });

  console.log(secondPage.hasMore, secondPage.nextCursor);
}
```

## Security and stability notes
- Never persist real authorization/cookie/csrf token values in source artifacts.
- QueryId, features, and response branches may change; refresh defaults when captures diverge.
- Prefer normalized fields for business logic and use `__original` for fallback diagnostics.
