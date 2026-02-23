import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildDeleteBookmarkRequest } from './default';
import {
  DELETE_BOOKMARK_DESC_TEXT,
  deleteBookmarkMeta,
  getDeleteBookmarkDefaultParams
} from './desc';
import { fetchDeleteBookmarkResponse } from './fetch';
import { normalizeDeleteBookmarkResponse } from './normalize';
import type { DeleteBookmarkRequest, DeleteBookmarkResponse } from './types';

async function deleteBookmarkImpl(input: DeleteBookmarkRequest): Promise<DeleteBookmarkResponse> {
  const resolved = buildDeleteBookmarkRequest(input);
  const payload = await fetchDeleteBookmarkResponse(resolved);
  return normalizeDeleteBookmarkResponse(payload, resolved.variables.tweet_id);
}

/**
 * @summary Remove a tweet bookmark via GraphQL DeleteBookmark mutation.
 * @param input Delete-bookmark request with required `tweetId`.
 * @returns Normalized delete-bookmark result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.deleteBookmark({ tweetId: '42' });
 */
export const deleteBookmark = createCallableApi<DeleteBookmarkRequest, DeleteBookmarkResponse>(
  deleteBookmarkImpl,
  {
    desc: DELETE_BOOKMARK_DESC_TEXT,
    getDefaultParams: getDeleteBookmarkDefaultParams,
    meta: deleteBookmarkMeta
  }
);

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
