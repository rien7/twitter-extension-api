import { describe, expect, it } from 'vitest';

import {
  DEFAULT_UNFAVORITE_TWEET_ENDPOINT,
  DEFAULT_UNFAVORITE_TWEET_OPERATION_NAME,
  DEFAULT_UNFAVORITE_TWEET_QUERY_ID,
  DEFAULT_UNFAVORITE_TWEET_VARIABLES,
  buildUnfavoriteTweetRequest
} from '../api/action/unfavorite-tweet/default';

describe('unfavoriteTweet defaults', () => {
  it('builds a request from defaults and required tweetId', () => {
    const request = buildUnfavoriteTweetRequest({
      tweetId: '2025167189050053035'
    });

    expect(request.endpoint).toBe(DEFAULT_UNFAVORITE_TWEET_ENDPOINT);
    expect(request.operationName).toBe(DEFAULT_UNFAVORITE_TWEET_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_UNFAVORITE_TWEET_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_UNFAVORITE_TWEET_VARIABLES,
      tweet_id: '2025167189050053035'
    });
  });

  it('allows overrides while keeping tweetId as highest-priority field', () => {
    const request = buildUnfavoriteTweetRequest({
      tweetId: '2025000000000000002',
      queryId: 'custom-unfavorite-query-id',
      variablesOverride: {
        tweet_id: '2025999999999999999'
      }
    });

    expect(request.queryId).toBe('custom-unfavorite-query-id');
    expect(request.endpoint).toBe('/i/api/graphql/custom-unfavorite-query-id/UnfavoriteTweet');
    expect(request.variables.tweet_id).toBe('2025000000000000002');
  });

  it('rejects empty tweetId at runtime', () => {
    expect(() => {
      buildUnfavoriteTweetRequest({
        tweetId: ''
      });
    }).toThrowError('unfavorite-tweet requires a non-empty tweetId');
  });
});
