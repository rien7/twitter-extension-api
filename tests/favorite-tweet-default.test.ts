import { describe, expect, it } from 'vitest';

import {
  buildFavoriteTweetRequest,
  DEFAULT_FAVORITE_TWEET_ENDPOINT,
  DEFAULT_FAVORITE_TWEET_OPERATION_NAME,
  DEFAULT_FAVORITE_TWEET_QUERY_ID,
  DEFAULT_FAVORITE_TWEET_VARIABLES
} from '../api/action/favorite-tweet/default';

describe('favoriteTweet defaults', () => {
  it('builds a request from defaults and required tweetId', () => {
    const request = buildFavoriteTweetRequest({
      tweetId: '42'
    });

    expect(request.endpoint).toBe(DEFAULT_FAVORITE_TWEET_ENDPOINT);
    expect(request.operationName).toBe(DEFAULT_FAVORITE_TWEET_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_FAVORITE_TWEET_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_FAVORITE_TWEET_VARIABLES,
      tweet_id: '42'
    });
  });

  it('allows overrides while keeping tweetId as highest-priority field', () => {
    const request = buildFavoriteTweetRequest({
      tweetId: '42',
      queryId: 'custom-favorite-query-id',
      variablesOverride: {
        tweet_id: '42'
      }
    });

    expect(request.queryId).toBe('custom-favorite-query-id');
    expect(request.endpoint).toBe('/i/api/graphql/custom-favorite-query-id/FavoriteTweet');
    expect(request.variables.tweet_id).toBe('42');
  });

  it('rejects empty tweetId at runtime', () => {
    expect(() => {
      buildFavoriteTweetRequest({
        tweetId: ''
      });
    }).toThrowError('favorite-tweet requires a non-empty tweetId');
  });
});
