import { afterEach, describe, expect, it, vi } from 'vitest';
import { __resetSelfUserIdForTests } from '../src/sdk/self-user-id';

import {
  DEFAULT_USER_TWEETS_AND_REPLIES_FEATURES,
  DEFAULT_USER_TWEETS_AND_REPLIES_FIELD_TOGGLES,
  DEFAULT_USER_TWEETS_AND_REPLIES_OPERATION_NAME,
  DEFAULT_USER_TWEETS_AND_REPLIES_QUERY_ID,
  DEFAULT_USER_TWEETS_AND_REPLIES_VARIABLES,
  buildUserTweetsAndRepliesRequest
} from '../api/query/user-tweets-and-replies/default';

describe('userTweetsAndReplies defaults', () => {
  afterEach(() => {
    __resetSelfUserIdForTests();
    vi.unstubAllGlobals();
  });

  it('builds a request from defaults and required userId', () => {
    const request = buildUserTweetsAndRepliesRequest({
      userId: '42'
    });

    expect(request.operationName).toBe(DEFAULT_USER_TWEETS_AND_REPLIES_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_USER_TWEETS_AND_REPLIES_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_USER_TWEETS_AND_REPLIES_VARIABLES,
      userId: '42'
    });
    expect(request.features).toEqual(DEFAULT_USER_TWEETS_AND_REPLIES_FEATURES);
    expect(request.fieldToggles).toEqual(DEFAULT_USER_TWEETS_AND_REPLIES_FIELD_TOGGLES);
  });

  it('allows overrides while keeping userId as highest-priority field', () => {
    const request = buildUserTweetsAndRepliesRequest({
      userId: 'target-user',
      count: 60,
      withCommunity: false,
      variablesOverride: {
        userId: 'other-user',
        withVoice: false
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
    expect(request.variables.count).toBe(60);
    expect(request.variables.withCommunity).toBe(false);
    expect(request.variables.withVoice).toBe(false);
    expect(request.features.articles_preview_enabled).toBe(false);
    expect(request.features.responsive_web_enhance_cards_enabled).toBe(true);
    expect(request.features.view_counts_everywhere_api_enabled).toBe(true);
    expect(request.fieldToggles.withArticlePlainText).toBe(true);
  });

  it('rejects empty userId at runtime', () => {
    vi.stubGlobal('document', { cookie: '' });

    expect(() => {
      buildUserTweetsAndRepliesRequest({
        userId: ''
      });
    }).toThrowError('default self userId could not be resolved from twid cookie');
  });

  it('uses self userId from twid cookie when input userId is omitted', () => {
    vi.stubGlobal('document', {
      cookie: 'twid=u%3D42'
    });

    const request = buildUserTweetsAndRepliesRequest();
    expect(request.variables.userId).toBe('42');
  });
});
