import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_DELETE_RETWEET_ENDPOINT,
  DEFAULT_DELETE_RETWEET_OPERATION_NAME,
  DEFAULT_DELETE_RETWEET_QUERY_ID,
  DEFAULT_DELETE_RETWEET_VARIABLES
} from './default';

export const DELETE_RETWEET_DESC_TEXT = [
  '[delete-retweet]',
  'Purpose: Undo a retweet by source tweet id.',
  'Call: window.x.api.action.deleteRetweet(input)',
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
  'Returns: success, targetTweetId, resultTweetId, errors'
].join('\n');

const DELETE_RETWEET_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_DELETE_RETWEET_ENDPOINT,
  queryId: DEFAULT_DELETE_RETWEET_QUERY_ID,
  operationName: DEFAULT_DELETE_RETWEET_OPERATION_NAME,
  variables: { ...DEFAULT_DELETE_RETWEET_VARIABLES }
});

export function getDeleteRetweetDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(DELETE_RETWEET_DEFAULT_PARAMS_TEMPLATE);
}

export const deleteRetweetMeta: XApiMeta = {
  id: 'delete-retweet',
  title: 'Delete Retweet',
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/DeleteRetweet',
    operationName: 'DeleteRetweet'
  },
  requestTypeName: 'DeleteRetweetRequest',
  responseTypeName: 'DeleteRetweetResponse'
};
