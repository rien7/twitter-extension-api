# notifications-timeline

## Purpose
Fetch the current account's notifications timeline (`NotificationsTimeline`) via Twitter/X GraphQL.

This API is suitable for:
- inbox-like notification list rendering,
- cursor-based notifications pagination,
- extracting normalized notification/tweet summaries while preserving full payload.

## Endpoint
- Method: `GET`
- Path pattern: `/i/api/graphql/*/NotificationsTimeline`
- OperationName: `NotificationsTimeline`

## Parameter Strategy

This module uses a query-minimal-input pattern:
- no required business field;
- protocol defaults (`queryId`, `variables`, `features`) are centralized in `default.ts`;
- callers can override low-level values using `variablesOverride` and `featuresOverride`.

## Request Type
Type name: `NotificationsTimelineRequest`

### Request fields
- `timelineType`: Convenience override for `variables.timeline_type`.
  Meaning: timeline bucket to load (captured default: `All`).
  Precedence: overrides `variablesOverride.timeline_type`.
- `count`: Convenience override for `variables.count`.
  Meaning: requested page size.
  Precedence: overrides `variablesOverride.count`.
- `cursor`: Convenience override for `variables.cursor`.
  Meaning: pagination cursor for next-page requests.
  Precedence: overrides `variablesOverride.cursor`.
- `variablesOverride`: Partial override merged into default variables.
- `featuresOverride`: Partial override merged into default feature flags.
- `headers`: Optional custom headers merged by shared `buildGraphqlHeaders`.
- `endpoint` / `queryId` / `operationName`: Optional protocol overrides for experiments.

### Default merge order
`buildNotificationsTimelineRequest(input)` merges in this order:
1. defaults from `default.ts`,
2. `variablesOverride` / `featuresOverride`,
3. explicit convenience fields (`timelineType`, `count`, `cursor`).

## Response Type
Type name: `NotificationsTimelineResponse`

### Normalized top-level fields
- `timelineId`: Notification timeline id from `data.viewer_v2.user_results.result.notification_timeline.id`.
- `viewerUserId`: Current viewer user id from `data.viewer_v2.user_results.result.rest_id`.
- `instructions`: Raw timeline instructions array.
- `entries`: Flattened entries from `TimelineAddEntries`.
- `notifications`: Extracted summaries for `TimelineNotification` entries.
- `tweets`: Extracted summaries for `TimelineTweet` entries.
- `cursorTop` / `cursorBottom`: Raw top and bottom cursors.
- `nextCursor` / `prevCursor` / `hasMore`: Unified cursor pagination fields.
- `unreadMarkerSortIndex`: Sort marker from `TimelineMarkEntriesUnreadGreaterThanSortIndex`.
- `clearedUnreadState`: `true` when `TimelineClearEntriesUnreadState` instruction exists.
- `errors`: GraphQL errors array (if provided).
- `__original`: Full parsed server payload.

### `notifications[]` fields and extraction
- `notificationId`: `entry.content.itemContent.id`.
- `icon`: `entry.content.itemContent.notification_icon`.
- `messageText`: `entry.content.itemContent.rich_message.text`.
- `timestampMs`: `entry.content.itemContent.timestamp_ms`.
- `url` / `urlType`: `entry.content.itemContent.notification_url`.
- `templateType`: `entry.content.itemContent.template.__typename`.
- `fromUsers`: user summaries extracted from `template.from_users[].user_results.result`.
- `targetTweetIds`: tweet ids extracted from `template.target_objects[].tweet_results.result` and rich-message tweet refs.

### `tweets[]` fields and extraction
- `tweetId`: `tweet_results.result.rest_id`.
- `fullText`: `tweet_results.result.legacy.full_text`.
- `user`: author summary from `tweet_results.result.core.user_results.result`.
- `stats`: engagement counters from `tweet_results.result.legacy`.
- `viewerState`: bookmarked/favorited/retweeted state from `tweet_results.result.legacy`.

## Error model and edge cases
- Throws when HTTP status is non-2xx.
- Throws when response is not valid JSON.
- Keeps GraphQL `errors` in normalized response when server returns them.
- Cursor-only pages are valid: `notifications`/`tweets` can be empty while `nextCursor` still exists.
- Some timeline entries are non-item instructions; only `TimelineAddEntries` are flattened into `entries`.

## Minimal usage example

```ts
import { notificationsTimeline } from '../api';

const page = await notificationsTimeline({
  count: 20
});
```

## Override/default-params example

```ts
import { notificationsTimeline } from '../api';

const page = await notificationsTimeline({
  timelineType: 'All',
  count: 40,
  featuresOverride: {
    articles_preview_enabled: false
  }
});
```

## Pagination example

```ts
import { notificationsTimeline } from '../api';

const firstPage = await notificationsTimeline({ count: 20 });

if (firstPage.nextCursor) {
  const secondPage = await notificationsTimeline({
    count: 20,
    cursor: firstPage.nextCursor
  });

  console.log(secondPage.hasMore, secondPage.nextCursor);
}
```

## Security and stability notes
- Never persist real authorization/cookie/csrf token values into source artifacts.
- QueryId, variables shape, and feature flags may change over time; refresh defaults from new captures when failures appear.
- Use normalized fields for business logic and `__original` for compatibility/debugging fallback.
