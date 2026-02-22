import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_LIKES_ENDPOINT,
  DEFAULT_LIKES_FEATURES,
  DEFAULT_LIKES_FIELD_TOGGLES,
  DEFAULT_LIKES_OPERATION_NAME,
  DEFAULT_LIKES_QUERY_ID,
  DEFAULT_LIKES_VARIABLES
} from './default';

export const LIKES_DESC_TEXT = [
  '[likes]',
  'Purpose: Fetch liked-tweets timeline for a user.',
  'Call: window.x.api.query.likes(input?)',
  'Input:',
  '  Required:',
  '    - none (userId defaults to self from twid)',
  '  Optional:',
  '    - userId',
  '    - count',
  '    - cursor',
  '    - variablesOverride',
  '    - featuresOverride',
  '    - fieldTogglesOverride',
  'Pagination: count + cursor -> nextCursor / prevCursor / hasMore',
  'Returns: tweets, conversationTweetIds, nextCursor, prevCursor, hasMore, errors'
].join('\n');

const LIKES_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_LIKES_ENDPOINT,
  queryId: DEFAULT_LIKES_QUERY_ID,
  operationName: DEFAULT_LIKES_OPERATION_NAME,
  variables: { ...DEFAULT_LIKES_VARIABLES },
  features: { ...DEFAULT_LIKES_FEATURES },
  fieldToggles: { ...DEFAULT_LIKES_FIELD_TOGGLES }
});

export function getLikesDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(LIKES_DEFAULT_PARAMS_TEMPLATE);
}

export const likesMeta: XApiMeta = {
  id: 'likes',
  title: 'Likes Timeline',
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/Likes',
    operationName: 'Likes'
  },
  requestTypeName: 'LikesRequest',
  responseTypeName: 'LikesResponse',
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
