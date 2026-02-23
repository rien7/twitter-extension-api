import { describe, expect, it } from 'vitest';

import {
  DEFAULT_TWEET_DETAIL_FEATURES,
  DEFAULT_TWEET_DETAIL_FIELD_TOGGLES,
  DEFAULT_TWEET_DETAIL_OPERATION_NAME,
  DEFAULT_TWEET_DETAIL_QUERY_ID,
  DEFAULT_TWEET_DETAIL_VARIABLES,
  buildTweetDetailRequest
} from '../api/query/tweet-detail/default';

describe('tweetDetail defaults', () => {
  it('builds a request from defaults and required detailId', () => {
    const request = buildTweetDetailRequest({
      detailId: '42'
    });

    expect(request.operationName).toBe(DEFAULT_TWEET_DETAIL_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_TWEET_DETAIL_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_TWEET_DETAIL_VARIABLES,
      focalTweetId: '42'
    });
    expect(request.features).toEqual(DEFAULT_TWEET_DETAIL_FEATURES);
    expect(request.fieldToggles).toEqual(DEFAULT_TWEET_DETAIL_FIELD_TOGGLES);
  });

  it('allows overrides while keeping detailId as highest-priority field', () => {
    const request = buildTweetDetailRequest({
      detailId: '42',
      variablesOverride: {
        focalTweetId: '42',
        referrer: 'TweetDetailPage'
      },
      featuresOverride: {
        articles_preview_enabled: false,
        responsive_web_enhance_cards_enabled: true
      },
      fieldTogglesOverride: {
        withGrokAnalyze: true
      }
    });

    expect(request.variables.referrer).toBe('TweetDetailPage');
    expect(request.variables.focalTweetId).toBe('42');
    expect(request.features.articles_preview_enabled).toBe(false);
    expect(request.features.responsive_web_enhance_cards_enabled).toBe(true);
    expect(request.features.view_counts_everywhere_api_enabled).toBe(true);
    expect(request.fieldToggles.withGrokAnalyze).toBe(true);
    expect(request.fieldToggles.withArticleRichContentState).toBe(true);
  });

  it('rejects empty detailId at runtime', () => {
    expect(() => {
      buildTweetDetailRequest({
        detailId: ''
      });
    }).toThrowError('tweet-detail requires a non-empty detailId');
  });
});
