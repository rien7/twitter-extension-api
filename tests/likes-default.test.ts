import { afterEach, describe, expect, it, vi } from 'vitest';
import { __resetSelfUserIdForTests } from '../src/sdk/self-user-id';

import {
  DEFAULT_LIKES_FEATURES,
  DEFAULT_LIKES_FIELD_TOGGLES,
  DEFAULT_LIKES_OPERATION_NAME,
  DEFAULT_LIKES_QUERY_ID,
  DEFAULT_LIKES_VARIABLES,
  buildLikesRequest
} from '../api/query/likes/default';

describe('likes defaults', () => {
  afterEach(() => {
    __resetSelfUserIdForTests();
    vi.unstubAllGlobals();
  });

  it('builds a request from defaults and required userId', () => {
    const request = buildLikesRequest({
      userId: '42'
    });

    expect(request.operationName).toBe(DEFAULT_LIKES_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_LIKES_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_LIKES_VARIABLES,
      userId: '42'
    });
    expect(request.features).toEqual(DEFAULT_LIKES_FEATURES);
    expect(request.fieldToggles).toEqual(DEFAULT_LIKES_FIELD_TOGGLES);
  });

  it('allows overrides while keeping userId as highest-priority field', () => {
    const request = buildLikesRequest({
      userId: 'target-user',
      count: 40,
      variablesOverride: {
        userId: 'other-user',
        withBirdwatchNotes: true,
        withClientEventToken: true
      },
      featuresOverride: {
        articles_preview_enabled: false,
        responsive_web_enhance_cards_enabled: true
      },
      fieldTogglesOverride: {
        withArticlePlainText: true
      }
    });

    expect(request.variables.userId).toBe('target-user');
    expect(request.variables.count).toBe(40);
    expect(request.variables.withBirdwatchNotes).toBe(true);
    expect(request.variables.withClientEventToken).toBe(true);
    expect(request.features.articles_preview_enabled).toBe(false);
    expect(request.features.responsive_web_enhance_cards_enabled).toBe(true);
    expect(request.features.view_counts_everywhere_api_enabled).toBe(true);
    expect(request.fieldToggles.withArticlePlainText).toBe(true);
  });

  it('rejects empty userId at runtime', () => {
    vi.stubGlobal('document', { cookie: '' });

    expect(() => {
      buildLikesRequest({
        userId: ''
      });
    }).toThrowError('default self userId could not be resolved from twid cookie');
  });

  it('uses self userId from twid cookie when input userId is omitted', () => {
    vi.stubGlobal('document', {
      cookie: 'twid=u%3D42'
    });

    const request = buildLikesRequest();
    expect(request.variables.userId).toBe('42');
  });
});
