import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import { DEFAULT_UNBLOCK_ENDPOINT, DEFAULT_UNBLOCK_FORM } from './default';

export const UNBLOCK_DESC_TEXT = [
  '[unblock]',
  'Purpose: Unblock a target user.',
  'Call: window.x.api.action.unblock(input)',
  'Input:',
  '  Required:',
  '    - userId',
  '  Optional:',
  '    - endpoint',
  '    - headers',
  '    - formOverride',
  'Returns: success, userId, targetUser, relationship, errors'
].join('\n');

const UNBLOCK_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_UNBLOCK_ENDPOINT,
  form: { ...DEFAULT_UNBLOCK_FORM }
});

export function getUnblockDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(UNBLOCK_DEFAULT_PARAMS_TEMPLATE);
}

export const unblockMeta: XApiMeta = {
  id: 'unblock',
  title: 'Unblock User',
  match: {
    method: 'POST',
    path: '/i/api/1.1/blocks/destroy.json'
  },
  requestTypeName: 'UnblockRequest',
  responseTypeName: 'UnblockResponse'
};
