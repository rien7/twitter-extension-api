import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildCreateBookmarkRequest } from './default';
import {
  CREATE_BOOKMARK_DESC_TEXT,
  createBookmarkMeta,
  getCreateBookmarkDefaultParams
} from './desc';
import { fetchCreateBookmarkResponse } from './fetch';
import { normalizeCreateBookmarkResponse } from './normalize';
import type { CreateBookmarkRequest, CreateBookmarkResponse } from './types';

async function createBookmarkImpl(input: CreateBookmarkRequest): Promise<CreateBookmarkResponse> {
  const resolved = buildCreateBookmarkRequest(input);
  const payload = await fetchCreateBookmarkResponse(resolved);
  return normalizeCreateBookmarkResponse(payload, resolved.variables.tweet_id);
}

/**
 * @summary Bookmark a tweet via GraphQL CreateBookmark mutation.
 * @param input Bookmark request with required `tweetId`.
 * @returns Normalized bookmark result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.createBookmark({ tweetId: '42' });
 */
export const createBookmark = createCallableApi<CreateBookmarkRequest, CreateBookmarkResponse>(
  createBookmarkImpl,
  {
    desc: CREATE_BOOKMARK_DESC_TEXT,
    getDefaultParams: getCreateBookmarkDefaultParams,
    meta: createBookmarkMeta
  }
);

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
