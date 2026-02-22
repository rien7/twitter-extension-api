import { afterEach, describe, expect, it, vi } from 'vitest';

import { likes } from '../api/query/likes';
import type { LikesOriginalResponse } from '../api/query/likes/types';

describe('likes response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns normalized fields and keeps full payload in __original', async () => {
    const rawPayload: LikesOriginalResponse = {
      data: {
        user: {
          result: {
            __typename: 'User',
            timeline: {
              timeline: {
                instructions: [
                  {
                    type: 'TimelineAddEntries',
                    entries: [
                      {
                        entryId: 'tweet-1',
                        sortIndex: '100',
                        content: {
                          __typename: 'TimelineTimelineItem',
                          itemContent: {
                            tweet_results: {
                              result: {
                                __typename: 'Tweet',
                                rest_id: '111',
                                source: 'web',
                                legacy: {
                                  full_text: 'liked tweet',
                                  created_at: 'Sun Feb 22 00:00:00 +0000 2026',
                                  lang: 'en',
                                  reply_count: 2,
                                  retweet_count: 3,
                                  favorite_count: 4,
                                  quote_count: 1,
                                  bookmark_count: 0,
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

    const response = await likes({
      userId: '1882474049324081152'
    });

    expect(response.entries).toHaveLength(2);
    expect(response.tweets).toHaveLength(1);
    expect(response.tweets[0].tweetId).toBe('111');
    expect(response.tweets[0].user?.screenName).toBe('alice');
    expect(response.tweets[0].stats?.likeCount).toBe(4);
    expect(response.cursorBottom).toBe('cursor-bottom-token');
    expect(response.nextCursor).toBe('cursor-bottom-token');
    expect(response.prevCursor).toBeUndefined();
    expect(response.hasMore).toBe(true);
    expect(response.conversationTweetIds).toContain('111');
    expect(response.__original).toEqual(rawPayload);
  });
});
