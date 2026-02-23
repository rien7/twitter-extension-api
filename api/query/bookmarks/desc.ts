import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_BOOKMARKS_ENDPOINT,
  DEFAULT_BOOKMARKS_FEATURES,
  DEFAULT_BOOKMARKS_OPERATION_NAME,
  DEFAULT_BOOKMARKS_QUERY_ID,
  DEFAULT_BOOKMARKS_VARIABLES
} from './default';

export const BOOKMARKS_DESC_TEXT = [
  '[bookmarks]',
  'Purpose: Fetch bookmarks timeline for the current account.',
  'Call: window.x.api.query.bookmarks(input?)',
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

const BOOKMARKS_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_BOOKMARKS_ENDPOINT,
  queryId: DEFAULT_BOOKMARKS_QUERY_ID,
  operationName: DEFAULT_BOOKMARKS_OPERATION_NAME,
  variables: { ...DEFAULT_BOOKMARKS_VARIABLES },
  features: { ...DEFAULT_BOOKMARKS_FEATURES }
});

export function getBookmarksDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(BOOKMARKS_DEFAULT_PARAMS_TEMPLATE);
}

export const bookmarksMeta: XApiMeta = {
  id: 'bookmarks',
  title: 'Bookmarks Timeline',
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/Bookmarks',
    operationName: 'Bookmarks',
    variablesShapeHash: 'cefdb064'
  },
  requestTypeName: 'BookmarksRequest',
  responseTypeName: 'BookmarksResponse',
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
