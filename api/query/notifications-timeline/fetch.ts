import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import type {
  NotificationsTimelineOriginalResponse,
  NotificationsTimelineResolvedRequest
} from './types';

export async function fetchNotificationsTimelineResponse(
  request: NotificationsTimelineResolvedRequest
): Promise<NotificationsTimelineOriginalResponse> {
  const requestUrl = buildNotificationsTimelineUrl(request);

  const response = await fetch(requestUrl, {
    method: 'GET',
    credentials: 'include',
    headers: buildGraphqlHeaders(request.headers)
  });

  const responseText = await response.text();
  let payload: NotificationsTimelineOriginalResponse;

  try {
    payload = JSON.parse(responseText) as NotificationsTimelineOriginalResponse;
  } catch {
    throw new Error(
      `notifications-timeline returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`notifications-timeline failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`notifications-timeline failed with status ${response.status}`);
  }

  return payload;
}

function buildNotificationsTimelineUrl(request: NotificationsTimelineResolvedRequest): string {
  const params = new URLSearchParams();
  params.set('variables', JSON.stringify(request.variables));
  params.set('features', JSON.stringify(request.features));

  const separator = request.endpoint.includes('?') ? '&' : '?';
  return `${request.endpoint}${separator}${params.toString()}`;
}
