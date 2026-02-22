import { describe, expect, it } from 'vitest';

import {
  DEFAULT_HOME_LATEST_TIMELINE_FEATURES,
  DEFAULT_HOME_LATEST_TIMELINE_OPERATION_NAME,
  DEFAULT_HOME_LATEST_TIMELINE_QUERY_ID,
  DEFAULT_HOME_LATEST_TIMELINE_VARIABLES,
  buildHomeLatestTimelineRequest
} from '../api/query/home-latest-timeline/default';

describe('homeLatestTimeline defaults', () => {
  it('builds a request from defaults when input is empty', () => {
    const request = buildHomeLatestTimelineRequest();

    expect(request.operationName).toBe(DEFAULT_HOME_LATEST_TIMELINE_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_HOME_LATEST_TIMELINE_QUERY_ID);
    expect(request.variables).toEqual(DEFAULT_HOME_LATEST_TIMELINE_VARIABLES);
    expect(request.features).toEqual(DEFAULT_HOME_LATEST_TIMELINE_FEATURES);
  });

  it('allows convenience overrides and partial overrides', () => {
    const request = buildHomeLatestTimelineRequest({
      count: 40,
      cursor: 'cursor-bottom',
      includePromotedContent: false,
      variablesOverride: {
        requestContext: 'manual-refresh'
      },
      featuresOverride: {
        responsive_web_graphql_timeline_navigation_enabled: false,
        articles_preview_enabled: false
      }
    });

    expect(request.variables.count).toBe(40);
    expect(request.variables.cursor).toBe('cursor-bottom');
    expect(request.variables.includePromotedContent).toBe(false);
    expect(request.variables.requestContext).toBe('manual-refresh');
    expect(request.features.responsive_web_graphql_timeline_navigation_enabled).toBe(false);
    expect(request.features.articles_preview_enabled).toBe(false);
    expect(request.features.view_counts_everywhere_api_enabled).toBe(true);
  });
});
