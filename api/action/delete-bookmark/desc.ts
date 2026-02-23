import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_DELETE_BOOKMARK_ENDPOINT,
  DEFAULT_DELETE_BOOKMARK_OPERATION_NAME,
  DEFAULT_DELETE_BOOKMARK_QUERY_ID,
  DEFAULT_DELETE_BOOKMARK_VARIABLES
} from './default';

export const DELETE_BOOKMARK_DESC_TEXT = [
  '[delete-bookmark]',
  'Purpose: Remove a tweet bookmark by tweet id.',
  'Call: window.x.api.action.deleteBookmark(input)',
  'Input:',
  '  Required:',
  '    - tweetId',
  '  Optional:',
  '    - endpoint',
  '    - headers',
  '    - queryId',
  '    - operationName',
  '    - variablesOverride',
  'Returns: success, tweetId, message, errors'
].join('\n');

const DELETE_BOOKMARK_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_DELETE_BOOKMARK_ENDPOINT,
  queryId: DEFAULT_DELETE_BOOKMARK_QUERY_ID,
  operationName: DEFAULT_DELETE_BOOKMARK_OPERATION_NAME,
  variables: { ...DEFAULT_DELETE_BOOKMARK_VARIABLES }
});

export function getDeleteBookmarkDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(DELETE_BOOKMARK_DEFAULT_PARAMS_TEMPLATE);
}

export const deleteBookmarkMeta: XApiMeta = {
  id: 'delete-bookmark',
  title: 'Delete Bookmark',
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/DeleteBookmark',
    operationName: 'DeleteBookmark'
  },
  requestTypeName: 'DeleteBookmarkRequest',
  responseTypeName: 'DeleteBookmarkResponse'
};
