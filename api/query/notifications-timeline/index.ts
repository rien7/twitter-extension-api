import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildNotificationsTimelineRequest } from './default';
import {
  getNotificationsTimelineDefaultParams,
  NOTIFICATIONS_TIMELINE_DESC_TEXT,
  notificationsTimelineMeta
} from './desc';
import { fetchNotificationsTimelineResponse } from './fetch';
import { normalizeNotificationsTimelineResponse } from './normalize';
import type {
  NotificationsTimelineRequest,
  NotificationsTimelineResponse
} from './types';

async function notificationsTimelineImpl(
  input: NotificationsTimelineRequest = {}
): Promise<NotificationsTimelineResponse> {
  const resolved = buildNotificationsTimelineRequest(input);
  const payload = await fetchNotificationsTimelineResponse(resolved);
  return normalizeNotificationsTimelineResponse(payload);
}

/**
 * @summary Fetch notifications timeline entries for current authenticated user.
 * @param input Optional query overrides. Omitted fields use `__default_params`.
 * @returns Normalized notifications timeline payload with full response in `__original`.
 * @example
 * const page = await window.x.api.query.notificationsTimeline({ count: 20 });
 */
export const notificationsTimeline = createCallableApi<
  NotificationsTimelineRequest,
  NotificationsTimelineResponse
>(notificationsTimelineImpl, {
  desc: NOTIFICATIONS_TIMELINE_DESC_TEXT,
  getDefaultParams: getNotificationsTimelineDefaultParams,
  meta: notificationsTimelineMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
