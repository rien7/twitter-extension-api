import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_HOME_LATEST_TIMELINE_ENDPOINT,
  DEFAULT_HOME_LATEST_TIMELINE_FEATURES,
  DEFAULT_HOME_LATEST_TIMELINE_OPERATION_NAME,
  DEFAULT_HOME_LATEST_TIMELINE_QUERY_ID,
  DEFAULT_HOME_LATEST_TIMELINE_VARIABLES
} from './default';

export const HOME_LATEST_TIMELINE_DESC_TEXT = [
  '[home-latest-timeline]',
  'Purpose: Fetch latest home timeline entries.',
  'Call: window.x.api.query.homeLatestTimeline(input?)',
  'Input:',
  '  Required:',
  '    - none',
  '  Optional:',
  '    - count',
  '    - cursor',
  '    - includePromotedContent',
  '    - variablesOverride',
  '    - featuresOverride',
  'Pagination: count + cursor -> nextCursor / prevCursor / hasMore',
  'Returns: tweets, entries, nextCursor, prevCursor, hasMore, errors'
].join('\n');

const HOME_LATEST_TIMELINE_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_HOME_LATEST_TIMELINE_ENDPOINT,
  queryId: DEFAULT_HOME_LATEST_TIMELINE_QUERY_ID,
  operationName: DEFAULT_HOME_LATEST_TIMELINE_OPERATION_NAME,
  variables: { ...DEFAULT_HOME_LATEST_TIMELINE_VARIABLES },
  features: { ...DEFAULT_HOME_LATEST_TIMELINE_FEATURES }
});

export function getHomeLatestTimelineDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(HOME_LATEST_TIMELINE_DEFAULT_PARAMS_TEMPLATE);
}

export const homeLatestTimelineMeta: XApiMeta = {
  id: 'home-latest-timeline',
  title: 'Home Latest Timeline',
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/HomeLatestTimeline',
    operationName: 'HomeLatestTimeline'
  },
  requestTypeName: 'HomeLatestTimelineRequest',
  responseTypeName: 'HomeLatestTimelineResponse',
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
