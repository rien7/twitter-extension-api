import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_UNFAVORITE_TWEET_ENDPOINT,
  DEFAULT_UNFAVORITE_TWEET_OPERATION_NAME,
  DEFAULT_UNFAVORITE_TWEET_QUERY_ID,
  DEFAULT_UNFAVORITE_TWEET_VARIABLES
} from './default';

export const UNFAVORITE_TWEET_DESC_TEXT = [
  '[unfavorite-tweet]',
  'Purpose: Unlike a tweet by tweet id.',
  'Call: window.x.api.action.unfavoriteTweet(input)',
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

const UNFAVORITE_TWEET_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_UNFAVORITE_TWEET_ENDPOINT,
  queryId: DEFAULT_UNFAVORITE_TWEET_QUERY_ID,
  operationName: DEFAULT_UNFAVORITE_TWEET_OPERATION_NAME,
  variables: { ...DEFAULT_UNFAVORITE_TWEET_VARIABLES }
});

export function getUnfavoriteTweetDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(UNFAVORITE_TWEET_DEFAULT_PARAMS_TEMPLATE);
}

export const unfavoriteTweetMeta: XApiMeta = {
  id: 'unfavorite-tweet',
  title: 'Unfavorite Tweet',
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/UnfavoriteTweet',
    operationName: 'UnfavoriteTweet'
  },
  requestTypeName: 'UnfavoriteTweetRequest',
  responseTypeName: 'UnfavoriteTweetResponse'
};
