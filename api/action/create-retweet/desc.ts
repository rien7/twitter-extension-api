import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_CREATE_RETWEET_ENDPOINT,
  DEFAULT_CREATE_RETWEET_OPERATION_NAME,
  DEFAULT_CREATE_RETWEET_QUERY_ID,
  DEFAULT_CREATE_RETWEET_VARIABLES
} from './default';

export const CREATE_RETWEET_DESC_TEXT = [
  '[create-retweet]',
  'Purpose: Retweet a source tweet by tweet id.',
  'Call: window.x.api.action.createRetweet(input)',
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

const CREATE_RETWEET_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_CREATE_RETWEET_ENDPOINT,
  queryId: DEFAULT_CREATE_RETWEET_QUERY_ID,
  operationName: DEFAULT_CREATE_RETWEET_OPERATION_NAME,
  variables: { ...DEFAULT_CREATE_RETWEET_VARIABLES }
});

export function getCreateRetweetDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(CREATE_RETWEET_DEFAULT_PARAMS_TEMPLATE);
}

export const createRetweetMeta: XApiMeta = {
  id: 'create-retweet',
  title: 'Create Retweet',
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/CreateRetweet',
    operationName: 'CreateRetweet'
  },
  requestTypeName: 'CreateRetweetRequest',
  responseTypeName: 'CreateRetweetResponse'
};
