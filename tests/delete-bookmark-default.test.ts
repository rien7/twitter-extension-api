import { describe, expect, it } from 'vitest';

import {
  DEFAULT_DELETE_BOOKMARK_ENDPOINT,
  DEFAULT_DELETE_BOOKMARK_OPERATION_NAME,
  DEFAULT_DELETE_BOOKMARK_QUERY_ID,
  DEFAULT_DELETE_BOOKMARK_VARIABLES,
  buildDeleteBookmarkRequest
} from '../api/action/delete-bookmark/default';

describe('deleteBookmark defaults', () => {
  it('builds a request from defaults and required tweetId', () => {
    const request = buildDeleteBookmarkRequest({
      tweetId: '42'
    });

    expect(request.endpoint).toBe(DEFAULT_DELETE_BOOKMARK_ENDPOINT);
    expect(request.operationName).toBe(DEFAULT_DELETE_BOOKMARK_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_DELETE_BOOKMARK_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_DELETE_BOOKMARK_VARIABLES,
      tweet_id: '42'
    });
  });

  it('allows overrides while keeping tweetId as highest-priority field', () => {
    const request = buildDeleteBookmarkRequest({
      tweetId: '42',
      queryId: 'custom-delete-bookmark-query-id',
      variablesOverride: {
        tweet_id: '42'
      }
    });

    expect(request.queryId).toBe('custom-delete-bookmark-query-id');
    expect(request.endpoint).toBe('/i/api/graphql/custom-delete-bookmark-query-id/DeleteBookmark');
    expect(request.variables.tweet_id).toBe('42');
  });

  it('rejects empty tweetId at runtime', () => {
    expect(() => {
      buildDeleteBookmarkRequest({
        tweetId: ''
      });
    }).toThrowError('delete-bookmark requires a non-empty tweetId');
  });
});
