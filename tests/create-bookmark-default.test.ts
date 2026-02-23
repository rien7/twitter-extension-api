import { describe, expect, it } from 'vitest';

import {
  DEFAULT_CREATE_BOOKMARK_ENDPOINT,
  DEFAULT_CREATE_BOOKMARK_OPERATION_NAME,
  DEFAULT_CREATE_BOOKMARK_QUERY_ID,
  DEFAULT_CREATE_BOOKMARK_VARIABLES,
  buildCreateBookmarkRequest
} from '../api/action/create-bookmark/default';

describe('createBookmark defaults', () => {
  it('builds a request from defaults and required tweetId', () => {
    const request = buildCreateBookmarkRequest({
      tweetId: '42'
    });

    expect(request.endpoint).toBe(DEFAULT_CREATE_BOOKMARK_ENDPOINT);
    expect(request.operationName).toBe(DEFAULT_CREATE_BOOKMARK_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_CREATE_BOOKMARK_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_CREATE_BOOKMARK_VARIABLES,
      tweet_id: '42'
    });
  });

  it('allows overrides while keeping tweetId as highest-priority field', () => {
    const request = buildCreateBookmarkRequest({
      tweetId: '42',
      queryId: 'custom-create-bookmark-query-id',
      variablesOverride: {
        tweet_id: '42'
      }
    });

    expect(request.queryId).toBe('custom-create-bookmark-query-id');
    expect(request.endpoint).toBe('/i/api/graphql/custom-create-bookmark-query-id/CreateBookmark');
    expect(request.variables.tweet_id).toBe('42');
  });

  it('rejects empty tweetId at runtime', () => {
    expect(() => {
      buildCreateBookmarkRequest({
        tweetId: ''
      });
    }).toThrowError('create-bookmark requires a non-empty tweetId');
  });
});
