import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import { DEFAULT_FOLLOW_ENDPOINT, DEFAULT_FOLLOW_FORM } from './default';

export const FOLLOW_DESC_TEXT = [
  '[follow]',
  'Purpose: Follow a target user.',
  'Call: window.x.api.action.follow(input)',
  'Input:',
  '  Required:',
  '    - userId',
  '  Optional:',
  '    - endpoint',
  '    - headers',
  '    - formOverride',
  'Returns: success, targetUserId, targetUser, relationship, errors'
].join('\n');

const FOLLOW_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_FOLLOW_ENDPOINT,
  form: { ...DEFAULT_FOLLOW_FORM }
});

export function getFollowDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(FOLLOW_DEFAULT_PARAMS_TEMPLATE);
}

export const followMeta: XApiMeta = {
  id: 'follow',
  title: 'Follow User',
  match: {
    method: 'POST',
    path: '/i/api/1.1/friendships/create.json'
  },
  requestTypeName: 'FollowRequest',
  responseTypeName: 'FollowResponse'
};
