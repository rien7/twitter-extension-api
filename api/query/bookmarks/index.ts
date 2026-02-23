import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildBookmarksRequest } from './default';
import { BOOKMARKS_DESC_TEXT, bookmarksMeta, getBookmarksDefaultParams } from './desc';
import { fetchBookmarksResponse } from './fetch';
import { normalizeBookmarksResponse } from './normalize';
import type { BookmarksRequest, BookmarksResponse } from './types';

async function bookmarksImpl(input: BookmarksRequest = {}): Promise<BookmarksResponse> {
  const resolved = buildBookmarksRequest(input);
  const payload = await fetchBookmarksResponse(resolved);
  return normalizeBookmarksResponse(payload);
}

/**
 * @summary Fetch bookmarks timeline for current authenticated user.
 * @param input Optional query overrides. Omitted fields use `__default_params`.
 * @returns Normalized bookmarks timeline with full payload in `__original`.
 * @example
 * const page = await window.x.api.query.bookmarks({ count: 20 });
 */
export const bookmarks = createCallableApi<BookmarksRequest, BookmarksResponse>(bookmarksImpl, {
  desc: BOOKMARKS_DESC_TEXT,
  getDefaultParams: getBookmarksDefaultParams,
  meta: bookmarksMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
