import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_USER_TWEETS_ENDPOINT,
  DEFAULT_USER_TWEETS_FEATURES,
  DEFAULT_USER_TWEETS_FIELD_TOGGLES,
  DEFAULT_USER_TWEETS_OPERATION_NAME,
  DEFAULT_USER_TWEETS_QUERY_ID,
  DEFAULT_USER_TWEETS_VARIABLES
} from './default';

export const USER_TWEETS_DESC_TEXT = [
  '[user-tweets]',
  'Purpose: Fetch user tweets timeline.',
  'Call: window.x.api.query.userTweets(input?)',
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

const USER_TWEETS_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_USER_TWEETS_ENDPOINT,
  queryId: DEFAULT_USER_TWEETS_QUERY_ID,
  operationName: DEFAULT_USER_TWEETS_OPERATION_NAME,
  variables: { ...DEFAULT_USER_TWEETS_VARIABLES },
  features: { ...DEFAULT_USER_TWEETS_FEATURES },
  fieldToggles: { ...DEFAULT_USER_TWEETS_FIELD_TOGGLES }
});

export function getUserTweetsDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(USER_TWEETS_DEFAULT_PARAMS_TEMPLATE);
}

export const userTweetsMeta: XApiMeta = {
  id: 'user-tweets',
  title: 'User Tweets Timeline',
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/UserTweets',
    operationName: 'UserTweets'
  },
  requestTypeName: 'UserTweetsRequest',
  responseTypeName: 'UserTweetsResponse',
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
