import { describe, expect, it } from 'vitest';

import {
  DEFAULT_DELETE_TWEET_ENDPOINT,
  DEFAULT_DELETE_TWEET_OPERATION_NAME,
  DEFAULT_DELETE_TWEET_QUERY_ID,
  DEFAULT_DELETE_TWEET_VARIABLES,
  buildDeleteTweetRequest
} from '../api/action/delete-tweet/default';

describe('deleteTweet defaults', () => {
  it('builds a request from defaults and required tweetId', () => {
    const request = buildDeleteTweetRequest({
      tweetId: '42'
    });

    expect(request.endpoint).toBe(DEFAULT_DELETE_TWEET_ENDPOINT);
    expect(request.operationName).toBe(DEFAULT_DELETE_TWEET_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_DELETE_TWEET_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_DELETE_TWEET_VARIABLES,
      tweet_id: '42'
    });
  });

  it('allows overrides while keeping tweetId as highest-priority field', () => {
    const request = buildDeleteTweetRequest({
      tweetId: '42',
      queryId: 'custom-query-id',
      darkRequest: true,
      variablesOverride: {
        tweet_id: '42',
        dark_request: false
      }
    });

    expect(request.queryId).toBe('custom-query-id');
    expect(request.endpoint).toBe('/i/api/graphql/custom-query-id/DeleteTweet');
    expect(request.variables.tweet_id).toBe('42');
    expect(request.variables.dark_request).toBe(true);
  });

  it('rejects empty tweetId at runtime', () => {
    expect(() => {
      buildDeleteTweetRequest({
        tweetId: ''
      });
    }).toThrowError('delete-tweet requires a non-empty tweetId');
  });
});
