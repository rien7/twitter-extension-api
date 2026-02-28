import type { XApiMeta } from '../../../src/shared/types';
import {
  DEFAULT_SEARCH_TIMELINE_ENDPOINT,
  DEFAULT_SEARCH_TIMELINE_FEATURES,
  DEFAULT_SEARCH_TIMELINE_OPERATION_NAME,
  DEFAULT_SEARCH_TIMELINE_QUERY_ID,
  DEFAULT_SEARCH_TIMELINE_VARIABLES
} from './default';

export const SEARCH_TIMELINE_DESC_TEXT = [
  '[search-timeline]',
  'Purpose: Search tweets/users/lists via SearchTimeline GraphQL.',
  'Call: window.x.api.query.searchTimeline(input)',
  'Input:',
  '  Required:',
  '    - rawQuery',
  '  Optional:',
  '    - product (Top | Latest | People | Media | Lists)',
  '    - count',
  '    - cursor',
  '    - querySource',
  '    - withGrokTranslatedBio',
  '    - variablesOverride',
  '    - featuresOverride',
  'Pagination: count + cursor -> nextCursor / prevCursor / hasMore',
  'Returns: tweets, users, lists, entries, nextCursor, hasMore, errors'
].join('\n');

const SEARCH_TIMELINE_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_SEARCH_TIMELINE_ENDPOINT,
  queryId: DEFAULT_SEARCH_TIMELINE_QUERY_ID,
  operationName: DEFAULT_SEARCH_TIMELINE_OPERATION_NAME,
  variables: { ...DEFAULT_SEARCH_TIMELINE_VARIABLES },
  features: { ...DEFAULT_SEARCH_TIMELINE_FEATURES }
});

export function getSearchTimelineDefaultParams() {
  return {
    endpoint: SEARCH_TIMELINE_DEFAULT_PARAMS_TEMPLATE.endpoint,
    queryId: SEARCH_TIMELINE_DEFAULT_PARAMS_TEMPLATE.queryId,
    operationName: SEARCH_TIMELINE_DEFAULT_PARAMS_TEMPLATE.operationName,
    variables: { ...SEARCH_TIMELINE_DEFAULT_PARAMS_TEMPLATE.variables },
    features: { ...SEARCH_TIMELINE_DEFAULT_PARAMS_TEMPLATE.features }
  };
}

export const searchTimelineMeta: XApiMeta = {
  id: 'search-timeline',
  title: 'Search Timeline',
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/SearchTimeline',
    operationName: 'SearchTimeline'
  },
  requestTypeName: 'SearchTimelineRequest',
  responseTypeName: 'SearchTimelineResponse',
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
