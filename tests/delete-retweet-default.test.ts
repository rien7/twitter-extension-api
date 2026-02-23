import { describe, expect, it } from 'vitest';

import {
  DEFAULT_DELETE_RETWEET_ENDPOINT,
  DEFAULT_DELETE_RETWEET_OPERATION_NAME,
  DEFAULT_DELETE_RETWEET_QUERY_ID,
  DEFAULT_DELETE_RETWEET_VARIABLES,
  buildDeleteRetweetRequest
} from '../api/action/delete-retweet/default';

describe('deleteRetweet defaults', () => {
  it('builds a request from defaults and required tweetId', () => {
    const request = buildDeleteRetweetRequest({
      tweetId: '42'
    });

    expect(request.endpoint).toBe(DEFAULT_DELETE_RETWEET_ENDPOINT);
    expect(request.operationName).toBe(DEFAULT_DELETE_RETWEET_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_DELETE_RETWEET_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_DELETE_RETWEET_VARIABLES,
      source_tweet_id: '42'
    });
  });

  it('allows overrides while keeping tweetId as highest-priority field', () => {
    const request = buildDeleteRetweetRequest({
      tweetId: '42',
      queryId: 'custom-unretweet-query-id',
      darkRequest: true,
      variablesOverride: {
        source_tweet_id: '42',
        dark_request: false
      }
    });

    expect(request.queryId).toBe('custom-unretweet-query-id');
    expect(request.endpoint).toBe('/i/api/graphql/custom-unretweet-query-id/DeleteRetweet');
    expect(request.variables.source_tweet_id).toBe('42');
    expect(request.variables.dark_request).toBe(true);
  });

  it('rejects empty tweetId at runtime', () => {
    expect(() => {
      buildDeleteRetweetRequest({
        tweetId: ''
      });
    }).toThrowError('delete-retweet requires a non-empty tweetId');
  });
});
