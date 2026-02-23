import { describe, expect, it } from 'vitest';

import {
  DEFAULT_BOOKMARKS_FEATURES,
  DEFAULT_BOOKMARKS_OPERATION_NAME,
  DEFAULT_BOOKMARKS_QUERY_ID,
  DEFAULT_BOOKMARKS_VARIABLES,
  buildBookmarksRequest
} from '../api/query/bookmarks/default';

describe('bookmarks defaults', () => {
  it('builds request from defaults', () => {
    const request = buildBookmarksRequest();

    expect(request.operationName).toBe(DEFAULT_BOOKMARKS_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_BOOKMARKS_QUERY_ID);
    expect(request.variables).toEqual(DEFAULT_BOOKMARKS_VARIABLES);
    expect(request.features).toEqual(DEFAULT_BOOKMARKS_FEATURES);
  });

  it('allows convenience and partial override fields', () => {
    const request = buildBookmarksRequest({
      count: 40,
      cursor: 'cursor-bottom-token',
      includePromotedContent: false,
      variablesOverride: {
        count: 30
      },
      featuresOverride: {
        articles_preview_enabled: false,
        responsive_web_enhance_cards_enabled: true
      }
    });

    expect(request.variables.count).toBe(40);
    expect(request.variables.cursor).toBe('cursor-bottom-token');
    expect(request.variables.includePromotedContent).toBe(false);
    expect(request.features.articles_preview_enabled).toBe(false);
    expect(request.features.responsive_web_enhance_cards_enabled).toBe(true);
    expect(request.features.view_counts_everywhere_api_enabled).toBe(true);
  });
});
