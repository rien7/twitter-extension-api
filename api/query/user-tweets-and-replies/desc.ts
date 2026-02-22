import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_USER_TWEETS_AND_REPLIES_ENDPOINT,
  DEFAULT_USER_TWEETS_AND_REPLIES_FEATURES,
  DEFAULT_USER_TWEETS_AND_REPLIES_FIELD_TOGGLES,
  DEFAULT_USER_TWEETS_AND_REPLIES_OPERATION_NAME,
  DEFAULT_USER_TWEETS_AND_REPLIES_QUERY_ID,
  DEFAULT_USER_TWEETS_AND_REPLIES_VARIABLES
} from './default';

export const USER_TWEETS_AND_REPLIES_DESC_TEXT = [
  '[user-tweets-and-replies]',
  'Purpose: Fetch user tweets-and-replies timeline.',
  'Call: window.x.api.query.userTweetsAndReplies(input?)',
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

const USER_TWEETS_AND_REPLIES_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_USER_TWEETS_AND_REPLIES_ENDPOINT,
  queryId: DEFAULT_USER_TWEETS_AND_REPLIES_QUERY_ID,
  operationName: DEFAULT_USER_TWEETS_AND_REPLIES_OPERATION_NAME,
  variables: { ...DEFAULT_USER_TWEETS_AND_REPLIES_VARIABLES },
  features: { ...DEFAULT_USER_TWEETS_AND_REPLIES_FEATURES },
  fieldToggles: { ...DEFAULT_USER_TWEETS_AND_REPLIES_FIELD_TOGGLES }
});

export function getUserTweetsAndRepliesDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(USER_TWEETS_AND_REPLIES_DEFAULT_PARAMS_TEMPLATE);
}

export const userTweetsAndRepliesMeta: XApiMeta = {
  id: 'user-tweets-and-replies',
  title: 'User Tweets And Replies Timeline',
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/UserTweetsAndReplies',
    operationName: 'UserTweetsAndReplies'
  },
  requestTypeName: 'UserTweetsAndRepliesRequest',
  responseTypeName: 'UserTweetsAndRepliesResponse',
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
