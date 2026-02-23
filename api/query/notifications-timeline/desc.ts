import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_NOTIFICATIONS_TIMELINE_ENDPOINT,
  DEFAULT_NOTIFICATIONS_TIMELINE_FEATURES,
  DEFAULT_NOTIFICATIONS_TIMELINE_OPERATION_NAME,
  DEFAULT_NOTIFICATIONS_TIMELINE_QUERY_ID,
  DEFAULT_NOTIFICATIONS_TIMELINE_VARIABLES
} from './default';

export const NOTIFICATIONS_TIMELINE_DESC_TEXT = [
  '[notifications-timeline]',
  'Purpose: Fetch notifications timeline entries for current account.',
  'Call: window.x.api.query.notificationsTimeline(input?)',
  'Input:',
  '  Required:',
  '    - none',
  '  Optional:',
  '    - timelineType (default: All)',
  '    - count',
  '    - cursor',
  '    - variablesOverride',
  '    - featuresOverride',
  'Pagination: count + cursor -> nextCursor / prevCursor / hasMore',
  'Returns: notifications, tweets, entries, nextCursor, hasMore, errors'
].join('\n');

const NOTIFICATIONS_TIMELINE_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_NOTIFICATIONS_TIMELINE_ENDPOINT,
  queryId: DEFAULT_NOTIFICATIONS_TIMELINE_QUERY_ID,
  operationName: DEFAULT_NOTIFICATIONS_TIMELINE_OPERATION_NAME,
  variables: { ...DEFAULT_NOTIFICATIONS_TIMELINE_VARIABLES },
  features: { ...DEFAULT_NOTIFICATIONS_TIMELINE_FEATURES }
});

export function getNotificationsTimelineDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(NOTIFICATIONS_TIMELINE_DEFAULT_PARAMS_TEMPLATE);
}

export const notificationsTimelineMeta: XApiMeta = {
  id: 'notifications-timeline',
  title: 'Notifications Timeline',
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/NotificationsTimeline',
    operationName: 'NotificationsTimeline'
  },
  requestTypeName: 'NotificationsTimelineRequest',
  responseTypeName: 'NotificationsTimelineResponse',
  pagination: {
    strategy: 'cursor',
    countParam: 'count',
    cursorParam: 'cursor',
    nextCursorField: 'nextCursor',
    prevCursorField: 'prevCursor',
    hasMoreField: 'hasMore',
    defaultCount: 20,
    minCount: 1,
    maxCount: 100
  }
};
