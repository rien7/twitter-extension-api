import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SEARCH_TIMELINE_FEATURES,
  DEFAULT_SEARCH_TIMELINE_OPERATION_NAME,
  DEFAULT_SEARCH_TIMELINE_QUERY_ID,
  DEFAULT_SEARCH_TIMELINE_VARIABLES,
  buildSearchTimelineRequest
} from '../api/query/search-timeline/default';

describe('searchTimeline defaults', () => {
  it('builds request from defaults with required rawQuery', () => {
    const request = buildSearchTimelineRequest({
      rawQuery: 'hello world'
    });

    expect(request.operationName).toBe(DEFAULT_SEARCH_TIMELINE_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_SEARCH_TIMELINE_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_SEARCH_TIMELINE_VARIABLES,
      rawQuery: 'hello world'
    });
    expect(request.features).toEqual(DEFAULT_SEARCH_TIMELINE_FEATURES);
  });

  it('allows convenience and partial override fields', () => {
    const request = buildSearchTimelineRequest({
      rawQuery: 'hello world',
      product: 'People',
      count: 40,
      cursor: 'cursor-bottom-token',
      querySource: 'typed_query',
      withGrokTranslatedBio: true,
      variablesOverride: {
        count: 10,
        product: 'Top'
      },
      featuresOverride: {
        articles_preview_enabled: false,
        responsive_web_enhance_cards_enabled: true
      }
    });

    expect(request.variables.rawQuery).toBe('hello world');
    expect(request.variables.product).toBe('People');
    expect(request.variables.count).toBe(40);
    expect(request.variables.cursor).toBe('cursor-bottom-token');
    expect(request.variables.withGrokTranslatedBio).toBe(true);
    expect(request.features.articles_preview_enabled).toBe(false);
    expect(request.features.responsive_web_enhance_cards_enabled).toBe(true);
    expect(request.features.view_counts_everywhere_api_enabled).toBe(true);
  });

  it('throws when rawQuery is empty', () => {
    expect(() => {
      buildSearchTimelineRequest({
        rawQuery: '   '
      });
    }).toThrowError('search-timeline requires a non-empty rawQuery');
  });
});
