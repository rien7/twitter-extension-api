import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildHomeLatestTimelineRequest } from './default';
import {
  getHomeLatestTimelineDefaultParams,
  HOME_LATEST_TIMELINE_DESC_TEXT,
  homeLatestTimelineMeta
} from './desc';
import { fetchHomeLatestTimelineResponse } from './fetch';
import { normalizeHomeLatestTimelineResponse } from './normalize';
import type { HomeLatestTimelineRequest, HomeLatestTimelineResponse } from './types';

async function homeLatestTimelineImpl(
  input: HomeLatestTimelineRequest = {}
): Promise<HomeLatestTimelineResponse> {
  const resolved = buildHomeLatestTimelineRequest(input);
  const payload = await fetchHomeLatestTimelineResponse(resolved);
  return normalizeHomeLatestTimelineResponse(payload);
}

/**
 * @summary Fetch latest home timeline entries.
 * @param input Optional request overrides. Omitted fields use `__default_params`.
 * @returns Normalized timeline data with full payload in `__original`.
 * @example
 * const page = await window.x.api.query.homeLatestTimeline({ count: 20 });
 */
export const homeLatestTimeline = createCallableApi<HomeLatestTimelineRequest, HomeLatestTimelineResponse>(
  homeLatestTimelineImpl,
  {
    desc: HOME_LATEST_TIMELINE_DESC_TEXT,
    getDefaultParams: getHomeLatestTimelineDefaultParams,
    meta: homeLatestTimelineMeta
  }
);

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
