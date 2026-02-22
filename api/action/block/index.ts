import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildBlockRequest } from './default';
import { BLOCK_DESC_TEXT, blockMeta, getBlockDefaultParams } from './desc';
import { fetchBlockResponse } from './fetch';
import { normalizeBlockResponse } from './normalize';
import type { BlockRequest, BlockResponse } from './types';

async function blockImpl(input: BlockRequest): Promise<BlockResponse> {
  const resolved = buildBlockRequest(input);
  const payload = await fetchBlockResponse(resolved);
  return normalizeBlockResponse(payload, resolved.form.user_id);
}

/**
 * @summary Block a target user using blocks/create endpoint.
 * @param input Block request input with required `userId`.
 * @returns Normalized block result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.block({ userId: '42' });
 */
export const block = createCallableApi<BlockRequest, BlockResponse>(blockImpl, {
  desc: BLOCK_DESC_TEXT,
  getDefaultParams: getBlockDefaultParams,
  meta: blockMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
