import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildSearchTimelineRequest } from './default';
import {
  getSearchTimelineDefaultParams,
  SEARCH_TIMELINE_DESC_TEXT,
  searchTimelineMeta
} from './desc';
import { fetchSearchTimelineResponse } from './fetch';
import { normalizeSearchTimelineResponse } from './normalize';
import type {
  SearchTimelineRequest,
  SearchTimelineResponse
} from './types';

async function searchTimelineImpl(input: SearchTimelineRequest): Promise<SearchTimelineResponse> {
  const resolved = buildSearchTimelineRequest(input);
  const payload = await fetchSearchTimelineResponse(resolved);
  return normalizeSearchTimelineResponse(payload, resolved);
}

/**
 * @summary Search timeline across Top/Latest/People/Media/Lists tabs.
 * @param input Search request with required `rawQuery` and optional tab/pagination overrides.
 * @returns Normalized search timeline with tweets/users/lists and full payload in `__original`.
 * @example
 * const page = await window.x.api.query.searchTimeline({
 *   rawQuery: 'hello world',
 *   product: 'Latest',
 *   count: 20
 * });
 */
export const searchTimeline = createCallableApi<SearchTimelineRequest, SearchTimelineResponse>(
  searchTimelineImpl,
  {
    desc: SEARCH_TIMELINE_DESC_TEXT,
    getDefaultParams: getSearchTimelineDefaultParams,
    meta: searchTimelineMeta
  }
);

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
