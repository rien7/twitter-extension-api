import { describe, expect, it } from 'vitest';

import {
  buildCreateRetweetRequest,
  DEFAULT_CREATE_RETWEET_ENDPOINT,
  DEFAULT_CREATE_RETWEET_OPERATION_NAME,
  DEFAULT_CREATE_RETWEET_QUERY_ID,
  DEFAULT_CREATE_RETWEET_VARIABLES
} from '../api/action/create-retweet/default';

describe('createRetweet defaults', () => {
  it('builds a request from defaults and required tweetId', () => {
    const request = buildCreateRetweetRequest({
      tweetId: '42'
    });

    expect(request.endpoint).toBe(DEFAULT_CREATE_RETWEET_ENDPOINT);
    expect(request.operationName).toBe(DEFAULT_CREATE_RETWEET_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_CREATE_RETWEET_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_CREATE_RETWEET_VARIABLES,
      tweet_id: '42'
    });
  });

  it('allows overrides while keeping tweetId as highest-priority field', () => {
    const request = buildCreateRetweetRequest({
      tweetId: '42',
      queryId: 'custom-create-retweet-query-id',
      darkRequest: true,
      variablesOverride: {
        tweet_id: '42',
        dark_request: false
      }
    });

    expect(request.queryId).toBe('custom-create-retweet-query-id');
    expect(request.endpoint).toBe('/i/api/graphql/custom-create-retweet-query-id/CreateRetweet');
    expect(request.variables.tweet_id).toBe('42');
    expect(request.variables.dark_request).toBe(true);
  });

  it('rejects empty tweetId at runtime', () => {
    expect(() => {
      buildCreateRetweetRequest({
        tweetId: ''
      });
    }).toThrowError('create-retweet requires a non-empty tweetId');
  });
});
