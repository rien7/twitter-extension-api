import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_TWEET_DETAIL_ENDPOINT,
  DEFAULT_TWEET_DETAIL_FEATURES,
  DEFAULT_TWEET_DETAIL_FIELD_TOGGLES,
  DEFAULT_TWEET_DETAIL_OPERATION_NAME,
  DEFAULT_TWEET_DETAIL_QUERY_ID,
  DEFAULT_TWEET_DETAIL_VARIABLES
} from './default';

export const TWEET_DETAIL_DESC_TEXT = [
  '[tweet-detail]',
  'Purpose: Fetch tweet detail thread and related entries.',
  'Call: window.x.api.query.tweetDetail(input)',
  'Input:',
  '  Required:',
  '    - detailId',
  '  Optional:',
  '    - endpoint',
  '    - headers',
  '    - queryId',
  '    - operationName',
  '    - variablesOverride',
  '    - featuresOverride',
  '    - fieldTogglesOverride',
  'Returns: focalTweet, tweets, entries, nextCursor, prevCursor, hasMore, errors'
].join('\n');

const TWEET_DETAIL_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_TWEET_DETAIL_ENDPOINT,
  queryId: DEFAULT_TWEET_DETAIL_QUERY_ID,
  operationName: DEFAULT_TWEET_DETAIL_OPERATION_NAME,
  variables: { ...DEFAULT_TWEET_DETAIL_VARIABLES },
  features: { ...DEFAULT_TWEET_DETAIL_FEATURES },
  fieldToggles: { ...DEFAULT_TWEET_DETAIL_FIELD_TOGGLES }
});

export function getTweetDetailDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(TWEET_DETAIL_DEFAULT_PARAMS_TEMPLATE);
}

export const tweetDetailMeta: XApiMeta = {
  id: 'tweet-detail',
  title: 'Tweet Detail',
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/TweetDetail',
    operationName: 'TweetDetail'
  },
  requestTypeName: 'TweetDetailRequest',
  responseTypeName: 'TweetDetailResponse'
};
