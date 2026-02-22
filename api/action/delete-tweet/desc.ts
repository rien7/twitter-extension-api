import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_DELETE_TWEET_ENDPOINT,
  DEFAULT_DELETE_TWEET_OPERATION_NAME,
  DEFAULT_DELETE_TWEET_QUERY_ID,
  DEFAULT_DELETE_TWEET_VARIABLES
} from './default';

export const DELETE_TWEET_DESC_TEXT = [
  '[delete-tweet]',
  'Purpose: Delete a tweet by tweetId.',
  'Call: window.x.api.action.deleteTweet(input)',
  'Input:',
  '  Required:',
  '    - tweetId',
  '  Optional:',
  '    - endpoint',
  '    - headers',
  '    - queryId',
  '    - operationName',
  '    - darkRequest',
  '    - variablesOverride',
  'Returns: success, tweetId, deletedTweetId, errors'
].join('\n');

const DELETE_TWEET_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_DELETE_TWEET_ENDPOINT,
  queryId: DEFAULT_DELETE_TWEET_QUERY_ID,
  operationName: DEFAULT_DELETE_TWEET_OPERATION_NAME,
  variables: { ...DEFAULT_DELETE_TWEET_VARIABLES }
});

export function getDeleteTweetDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(DELETE_TWEET_DEFAULT_PARAMS_TEMPLATE);
}

export const deleteTweetMeta: XApiMeta = {
  id: 'delete-tweet',
  title: 'Delete Tweet',
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/DeleteTweet',
    operationName: 'DeleteTweet'
  },
  requestTypeName: 'DeleteTweetRequest',
  responseTypeName: 'DeleteTweetResponse'
};
