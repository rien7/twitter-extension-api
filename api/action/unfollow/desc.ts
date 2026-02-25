import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import { DEFAULT_UNFOLLOW_ENDPOINT, DEFAULT_UNFOLLOW_FORM } from './default';

export const UNFOLLOW_DESC_TEXT = [
  '[unfollow]',
  'Purpose: Unfollow a target user.',
  'Call: window.x.api.action.unfollow(input)',
  'Input:',
  '  Required:',
  '    - userId',
  '  Optional:',
  '    - endpoint',
  '    - headers',
  '    - formOverride',
  'Returns: success, targetUserId, targetUser, relationship, errors'
].join('\n');

const UNFOLLOW_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_UNFOLLOW_ENDPOINT,
  form: { ...DEFAULT_UNFOLLOW_FORM }
});

export function getUnfollowDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(UNFOLLOW_DEFAULT_PARAMS_TEMPLATE);
}

export const unfollowMeta: XApiMeta = {
  id: 'unfollow',
  title: 'Unfollow User',
  match: {
    method: 'POST',
    path: '/i/api/1.1/friendships/destroy.json'
  },
  requestTypeName: 'UnfollowRequest',
  responseTypeName: 'UnfollowResponse'
};
