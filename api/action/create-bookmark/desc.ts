import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_CREATE_BOOKMARK_ENDPOINT,
  DEFAULT_CREATE_BOOKMARK_OPERATION_NAME,
  DEFAULT_CREATE_BOOKMARK_QUERY_ID,
  DEFAULT_CREATE_BOOKMARK_VARIABLES
} from './default';

export const CREATE_BOOKMARK_DESC_TEXT = [
  '[create-bookmark]',
  'Purpose: Add a bookmark for a tweet by tweet id.',
  'Call: window.x.api.action.createBookmark(input)',
  'Input:',
  '  Required:',
  '    - tweetId',
  '  Optional:',
  '    - endpoint',
  '    - headers',
  '    - queryId',
  '    - operationName',
  '    - variablesOverride',
  'Returns: success, targetTweetId, message, errors'
].join('\n');

const CREATE_BOOKMARK_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_CREATE_BOOKMARK_ENDPOINT,
  queryId: DEFAULT_CREATE_BOOKMARK_QUERY_ID,
  operationName: DEFAULT_CREATE_BOOKMARK_OPERATION_NAME,
  variables: { ...DEFAULT_CREATE_BOOKMARK_VARIABLES }
});

export function getCreateBookmarkDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(CREATE_BOOKMARK_DEFAULT_PARAMS_TEMPLATE);
}

export const createBookmarkMeta: XApiMeta = {
  id: 'create-bookmark',
  title: 'Create Bookmark',
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/CreateBookmark',
    operationName: 'CreateBookmark'
  },
  requestTypeName: 'CreateBookmarkRequest',
  responseTypeName: 'CreateBookmarkResponse'
};
