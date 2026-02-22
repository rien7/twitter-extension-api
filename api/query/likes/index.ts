import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildLikesRequest } from './default';
import { getLikesDefaultParams, LIKES_DESC_TEXT, likesMeta } from './desc';
import { fetchLikesResponse } from './fetch';
import { normalizeLikesResponse } from './normalize';
import type { LikesRequest, LikesResponse } from './types';

async function likesImpl(input: LikesRequest = {}): Promise<LikesResponse> {
  const resolved = buildLikesRequest(input);
  const payload = await fetchLikesResponse(resolved);
  return normalizeLikesResponse(payload);
}

/**
 * @summary Fetch liked tweets timeline for a user.
 * @param input Optional query overrides. If `userId` is omitted, self user id from `twid` is used.
 * @returns Normalized likes timeline with full payload in `__original`.
 * @example
 * const page = await window.x.api.query.likes({ count: 20 });
 */
export const likes = createCallableApi<LikesRequest, LikesResponse>(likesImpl, {
  desc: LIKES_DESC_TEXT,
  getDefaultParams: getLikesDefaultParams,
  meta: likesMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
