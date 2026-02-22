import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_FOLLOW_LIST_ENDPOINT,
  DEFAULT_FOLLOW_LIST_FEATURES,
  DEFAULT_FOLLOW_LIST_OPERATION_NAME,
  DEFAULT_FOLLOW_LIST_QUERY_ID,
  DEFAULT_FOLLOW_LIST_VARIABLES
} from './default';

export const FOLLOW_LIST_DESC_TEXT = [
  '[follow-list]',
  'Purpose: Fetch following-list timeline for a user.',
  'Call: window.x.api.query.followList(input?)',
  'Input:',
  '  Required:',
  '    - none (userId defaults to self from twid)',
  '  Optional:',
  '    - userId',
  '    - count',
  '    - cursor',
  '    - variablesOverride',
  '    - featuresOverride',
  'Pagination: count + cursor -> nextCursor / prevCursor / hasMore',
  'Returns: users, entries, nextCursor, prevCursor, hasMore, errors'
].join('\n');

const FOLLOW_LIST_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_FOLLOW_LIST_ENDPOINT,
  queryId: DEFAULT_FOLLOW_LIST_QUERY_ID,
  operationName: DEFAULT_FOLLOW_LIST_OPERATION_NAME,
  variables: { ...DEFAULT_FOLLOW_LIST_VARIABLES },
  features: { ...DEFAULT_FOLLOW_LIST_FEATURES }
});

export function getFollowListDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(FOLLOW_LIST_DEFAULT_PARAMS_TEMPLATE);
}

export const followListMeta: XApiMeta = {
  id: 'follow-list',
  title: 'Follow List',
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/Following',
    operationName: 'Following'
  },
  requestTypeName: 'FollowListRequest',
  responseTypeName: 'FollowListResponse',
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
