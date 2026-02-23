import { afterEach, describe, expect, it, vi } from 'vitest';

import { bookmarks } from '../api/query/bookmarks';
import type { BookmarksOriginalResponse } from '../api/query/bookmarks/types';

describe('bookmarks response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns normalized fields and keeps full payload in __original', async () => {
    const rawPayload: BookmarksOriginalResponse = {
      data: {
        bookmark_timeline_v2: {
          timeline: {
            instructions: [
              {
                type: 'TimelineAddEntries',
                entries: [
                  {
                    entryId: 'tweet-42',
                    sortIndex: '100',
                    content: {
                      __typename: 'TimelineTimelineItem',
                      itemContent: {
                        tweet_results: {
                          result: {
                            __typename: 'Tweet',
                            rest_id: '42',
                            source: 'web',
                            legacy: {
                              full_text: 'bookmarked tweet',
                              created_at: 'Sun Feb 22 00:00:00 +0000 2026',
                              lang: 'en',
                              conversation_id_str: '42',
                              reply_count: 2,
                              retweet_count: 3,
                              favorite_count: 4,
                              quote_count: 1,
                              bookmark_count: 5,
                              bookmarked: true,
                              favorited: true,
                              retweeted: false
                            },
                            core: {
                              user_results: {
                                result: {
                                  __typename: 'User',
                                  rest_id: 'u1',
                                  core: {
                                    name: 'Alice',
                                    screen_name: 'alice'
                                  },
                                  verification: {
                                    verified: true
                                  }
                                }
                              }
                            },
                            views: {
                              count: '77'
                            }
                          }
                        }
                      }
                    }
                  },
                  {
                    entryId: 'cursor-bottom',
                    content: {
                      __typename: 'TimelineTimelineCursor',
                      cursorType: 'Bottom',
                      value: 'cursor-bottom-token'
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    };

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(JSON.stringify(rawPayload), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      })
    );

    const response = await bookmarks({
      count: 20
    });

    expect(response.entries).toHaveLength(2);
    expect(response.tweets).toHaveLength(1);
    expect(response.tweets[0].tweetId).toBe('42');
    expect(response.tweets[0].user?.screenName).toBe('alice');
    expect(response.tweets[0].stats.likeCount).toBe(4);
    expect(response.cursorBottom).toBe('cursor-bottom-token');
    expect(response.nextCursor).toBe('cursor-bottom-token');
    expect(response.prevCursor).toBeUndefined();
    expect(response.hasMore).toBe(true);
    expect(response.conversationTweetIds).toContain('42');
    expect(response.__original).toEqual(rawPayload);
  });
});
