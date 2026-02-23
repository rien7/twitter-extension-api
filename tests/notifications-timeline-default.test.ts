import { describe, expect, it } from 'vitest';

import {
  DEFAULT_NOTIFICATIONS_TIMELINE_FEATURES,
  DEFAULT_NOTIFICATIONS_TIMELINE_OPERATION_NAME,
  DEFAULT_NOTIFICATIONS_TIMELINE_QUERY_ID,
  DEFAULT_NOTIFICATIONS_TIMELINE_VARIABLES,
  buildNotificationsTimelineRequest
} from '../api/query/notifications-timeline/default';

describe('notifications-timeline defaults', () => {
  it('builds a request from defaults', () => {
    const request = buildNotificationsTimelineRequest();

    expect(request.operationName).toBe(DEFAULT_NOTIFICATIONS_TIMELINE_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_NOTIFICATIONS_TIMELINE_QUERY_ID);
    expect(request.variables).toEqual(DEFAULT_NOTIFICATIONS_TIMELINE_VARIABLES);
    expect(request.features).toEqual(DEFAULT_NOTIFICATIONS_TIMELINE_FEATURES);
  });

  it('allows convenience fields and partial override fields', () => {
    const request = buildNotificationsTimelineRequest({
      timelineType: 'All',
      count: 40,
      cursor: 'cursor-bottom-token',
      variablesOverride: {
        count: 30,
        timeline_type: 'All'
      },
      featuresOverride: {
        articles_preview_enabled: false,
        responsive_web_enhance_cards_enabled: true
      }
    });

    expect(request.variables.timeline_type).toBe('All');
    expect(request.variables.count).toBe(40);
    expect(request.variables.cursor).toBe('cursor-bottom-token');
    expect(request.features.articles_preview_enabled).toBe(false);
    expect(request.features.responsive_web_enhance_cards_enabled).toBe(true);
    expect(request.features.view_counts_everywhere_api_enabled).toBe(true);
  });

  it('uses queryId override in default endpoint construction', () => {
    const request = buildNotificationsTimelineRequest({
      queryId: 'custom-query-id'
    });

    expect(request.queryId).toBe('custom-query-id');
    expect(request.endpoint).toBe('/i/api/graphql/custom-query-id/NotificationsTimeline');
  });
});
