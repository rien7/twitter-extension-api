import { describe, expect, it } from 'vitest';

import {
  buildCreateTweetRequest,
  DEFAULT_CREATE_TWEET_ENDPOINT,
  DEFAULT_CREATE_TWEET_FEATURES,
  DEFAULT_CREATE_TWEET_OPERATION_NAME,
  DEFAULT_CREATE_TWEET_QUERY_ID,
  DEFAULT_CREATE_TWEET_VARIABLES
} from '../api/action/create-tweet/default';

describe('createTweet defaults', () => {
  it('builds a direct-tweet request from defaults and required tweetText', () => {
    const request = buildCreateTweetRequest({
      tweetText: 'hello'
    });

    expect(request.endpoint).toBe(DEFAULT_CREATE_TWEET_ENDPOINT);
    expect(request.operationName).toBe(DEFAULT_CREATE_TWEET_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_CREATE_TWEET_QUERY_ID);
    expect(request.mode).toBe('direct');
    expect(request.features).toEqual(DEFAULT_CREATE_TWEET_FEATURES);
    expect(request.variables).toEqual({
      ...DEFAULT_CREATE_TWEET_VARIABLES,
      tweet_text: 'hello'
    });
  });

  it('uses quote mode with quoteTweetId and removes reply variables', () => {
    const request = buildCreateTweetRequest({
      mode: 'quote',
      tweetText: 'check this',
      quoteTweetId: '42',
      queryId: 'custom-create-tweet-query-id',
      variablesOverride: {
        reply: {
          in_reply_to_tweet_id: '42',
          exclude_reply_user_ids: ['42']
        }
      }
    });

    expect(request.mode).toBe('quote');
    expect(request.queryId).toBe('custom-create-tweet-query-id');
    expect(request.endpoint).toBe('/i/api/graphql/custom-create-tweet-query-id/CreateTweet');
    expect(request.variables.attachment_url).toBe('https://x.com/i/status/42');
    expect(request.variables.reply).toBeUndefined();
  });

  it('uses reply mode with inReplyToTweetId and removes quote attachment', () => {
    const request = buildCreateTweetRequest({
      mode: 'reply',
      tweetText: 'replying',
      inReplyToTweetId: '42',
      excludeReplyUserIds: ['11', '22'],
      variablesOverride: {
        attachment_url: 'https://x.com/i/status/42'
      }
    });

    expect(request.mode).toBe('reply');
    expect(request.variables.reply).toEqual({
      in_reply_to_tweet_id: '42',
      exclude_reply_user_ids: ['11', '22']
    });
    expect(request.variables.attachment_url).toBeUndefined();
  });

  it('rejects empty tweetText and missing mode-specific required fields', () => {
    expect(() => {
      buildCreateTweetRequest({
        tweetText: ''
      });
    }).toThrowError('create-tweet requires a non-empty tweetText');

    expect(() => {
      buildCreateTweetRequest({
        mode: 'quote',
        tweetText: 'missing quote target'
      });
    }).toThrowError('create-tweet quote mode requires attachmentUrl or quoteTweetId');

    expect(() => {
      buildCreateTweetRequest({
        mode: 'reply',
        tweetText: 'missing reply target'
      } as unknown as Parameters<typeof buildCreateTweetRequest>[0]);
    }).toThrowError('create-tweet reply mode requires inReplyToTweetId');
  });
});
