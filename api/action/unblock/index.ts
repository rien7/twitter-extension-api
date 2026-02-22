import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildUnblockRequest } from './default';
import { UNBLOCK_DESC_TEXT, unblockMeta, getUnblockDefaultParams } from './desc';
import { fetchUnblockResponse } from './fetch';
import { normalizeUnblockResponse } from './normalize';
import type { UnblockRequest, UnblockResponse } from './types';

async function unblockImpl(input: UnblockRequest): Promise<UnblockResponse> {
  const resolved = buildUnblockRequest(input);
  const payload = await fetchUnblockResponse(resolved);
  return normalizeUnblockResponse(payload, resolved.form.user_id);
}

/**
 * @summary Unblock a target user using blocks/destroy endpoint.
 * @param input Unblock request input with required `userId`.
 * @returns Normalized unblock result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.unblock({ userId: '42' });
 */
export const unblock = createCallableApi<UnblockRequest, UnblockResponse>(unblockImpl, {
  desc: UNBLOCK_DESC_TEXT,
  getDefaultParams: getUnblockDefaultParams,
  meta: unblockMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
