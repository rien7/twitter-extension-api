import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_REMOVE_FOLLOWER_ENDPOINT,
  DEFAULT_REMOVE_FOLLOWER_OPERATION_NAME,
  DEFAULT_REMOVE_FOLLOWER_QUERY_ID,
  DEFAULT_REMOVE_FOLLOWER_VARIABLES
} from './default';

export const REMOVE_FOLLOWER_DESC_TEXT = [
  '[remove-follower]',
  'Purpose: Remove a follower relationship.',
  'Call: window.x.api.action.removeFollower(input)',
  'Input:',
  '  Required:',
  '    - targetUserId',
  '  Optional:',
  '    - endpoint',
  '    - headers',
  '    - queryId',
  '    - operationName',
  '    - variablesOverride',
  'Returns: success, targetUserId, resultType, reason, errors'
].join('\n');

const REMOVE_FOLLOWER_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_REMOVE_FOLLOWER_ENDPOINT,
  queryId: DEFAULT_REMOVE_FOLLOWER_QUERY_ID,
  operationName: DEFAULT_REMOVE_FOLLOWER_OPERATION_NAME,
  variables: { ...DEFAULT_REMOVE_FOLLOWER_VARIABLES }
});

export function getRemoveFollowerDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(REMOVE_FOLLOWER_DEFAULT_PARAMS_TEMPLATE);
}

export const removeFollowerMeta: XApiMeta = {
  id: 'remove-follower',
  title: 'Remove Follower',
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/RemoveFollower',
    operationName: 'RemoveFollower'
  },
  requestTypeName: 'RemoveFollowerRequest',
  responseTypeName: 'RemoveFollowerResponse'
};
