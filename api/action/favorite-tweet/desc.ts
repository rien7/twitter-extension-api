import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_FAVORITE_TWEET_ENDPOINT,
  DEFAULT_FAVORITE_TWEET_OPERATION_NAME,
  DEFAULT_FAVORITE_TWEET_QUERY_ID,
  DEFAULT_FAVORITE_TWEET_VARIABLES
} from './default';

export const FAVORITE_TWEET_DESC_TEXT = [
  '[favorite-tweet]',
  'Purpose: Like a tweet by tweet id.',
  'Call: window.x.api.action.favoriteTweet(input)',
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

const FAVORITE_TWEET_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_FAVORITE_TWEET_ENDPOINT,
  queryId: DEFAULT_FAVORITE_TWEET_QUERY_ID,
  operationName: DEFAULT_FAVORITE_TWEET_OPERATION_NAME,
  variables: { ...DEFAULT_FAVORITE_TWEET_VARIABLES }
});

export function getFavoriteTweetDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(FAVORITE_TWEET_DEFAULT_PARAMS_TEMPLATE);
}

export const favoriteTweetMeta: XApiMeta = {
  id: 'favorite-tweet',
  title: 'Favorite Tweet',
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/FavoriteTweet',
    operationName: 'FavoriteTweet'
  },
  requestTypeName: 'FavoriteTweetRequest',
  responseTypeName: 'FavoriteTweetResponse'
};
