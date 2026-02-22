import { afterEach, describe, expect, it, vi } from 'vitest';
import { __resetSelfUserIdForTests } from '../src/sdk/self-user-id';

import {
  DEFAULT_FOLLOW_LIST_FEATURES,
  DEFAULT_FOLLOW_LIST_OPERATION_NAME,
  DEFAULT_FOLLOW_LIST_QUERY_ID,
  DEFAULT_FOLLOW_LIST_VARIABLES,
  buildFollowListRequest
} from '../api/query/follow-list/default';

describe('followList defaults', () => {
  afterEach(() => {
    __resetSelfUserIdForTests();
    vi.unstubAllGlobals();
  });

  it('builds a request from defaults and required userId', () => {
    const request = buildFollowListRequest({
      userId: '42'
    });

    expect(request.operationName).toBe(DEFAULT_FOLLOW_LIST_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_FOLLOW_LIST_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_FOLLOW_LIST_VARIABLES,
      userId: '42'
    });
    expect(request.features).toEqual(DEFAULT_FOLLOW_LIST_FEATURES);
  });

  it('allows overrides while keeping userId as highest-priority field', () => {
    const request = buildFollowListRequest({
      userId: '100',
      cursor: 'cursor-bottom',
      count: 40,
      variablesOverride: {
        userId: '200',
        includePromotedContent: true
      },
      featuresOverride: {
        responsive_web_graphql_timeline_navigation_enabled: false
      }
    });

    expect(request.variables.userId).toBe('100');
    expect(request.variables.cursor).toBe('cursor-bottom');
    expect(request.variables.count).toBe(40);
    expect(request.variables.includePromotedContent).toBe(true);
    expect(request.features.responsive_web_graphql_timeline_navigation_enabled).toBe(false);
    expect(request.features.view_counts_everywhere_api_enabled).toBe(true);
  });

  it('rejects empty userId at runtime', () => {
    vi.stubGlobal('document', { cookie: '' });

    expect(() => {
      buildFollowListRequest({
        userId: ''
      });
    }).toThrowError('default self userId could not be resolved from twid cookie');
  });

  it('uses self userId from twid cookie when input userId is omitted', () => {
    vi.stubGlobal('document', {
      cookie: 'twid=u%3D42'
    });

    const request = buildFollowListRequest();
    expect(request.variables.userId).toBe('42');
  });
});
