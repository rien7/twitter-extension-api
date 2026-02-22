import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import { DEFAULT_BLOCK_ENDPOINT, DEFAULT_BLOCK_FORM } from './default';

export const BLOCK_DESC_TEXT = [
  '[block]',
  'Purpose: Block a target user.',
  'Call: window.x.api.action.block(input)',
  'Input:',
  '  Required:',
  '    - userId',
  '  Optional:',
  '    - endpoint',
  '    - headers',
  '    - formOverride',
  'Returns: success, userId, targetUser, relationship, errors'
].join('\n');

const BLOCK_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_BLOCK_ENDPOINT,
  form: { ...DEFAULT_BLOCK_FORM }
});

export function getBlockDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(BLOCK_DEFAULT_PARAMS_TEMPLATE);
}

export const blockMeta: XApiMeta = {
  id: 'block',
  title: 'Block User',
  match: {
    method: 'POST',
    path: '/i/api/1.1/blocks/create.json'
  },
  requestTypeName: 'BlockRequest',
  responseTypeName: 'BlockResponse'
};
