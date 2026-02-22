import { afterEach, describe, expect, it, vi } from 'vitest';

import { homeLatestTimeline } from '../api/query/home-latest-timeline';
import type { HomeLatestTimelineOriginalResponse } from '../api/query/home-latest-timeline/types';

describe('homeLatestTimeline response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns normalized fields and keeps full raw payload in __original', async () => {
    const rawPayload: HomeLatestTimelineOriginalResponse = {
      data: {
        home: {
          home_timeline_urt: {
            metadata: {
              scribeConfig: {
                page: 'home'
              }
            },
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
                              full_text: 'hello world',
                              created_at: 'Sun Feb 22 00:00:00 +0000 2026',
                              lang: 'en',
                              reply_count: 2,
                              retweet_count: 3,
                              favorite_count: 4,
                              quote_count: 5,
                              bookmark_count: 1
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
                                  legacy: {
                                    profile_image_url_https: 'https://img.example/avatar.jpg',
                                    verified: true
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

    const response = await homeLatestTimeline({});

    expect(response.scribePage).toBe('home');
    expect(response.cursorBottom).toBe('cursor-bottom-token');
    expect(response.nextCursor).toBe('cursor-bottom-token');
    expect(response.prevCursor).toBeUndefined();
    expect(response.hasMore).toBe(true);
    expect(response.entries).toHaveLength(2);
    expect(response.tweets).toHaveLength(1);
    expect(response.tweets[0].tweetId).toBe('111');
    expect(response.tweets[0].fullText).toBe('hello world');
    expect(response.tweets[0].user?.screenName).toBe('alice');
    expect(response.tweets[0].stats?.likeCount).toBe(4);
    expect(response.__original).toEqual(rawPayload);
  });
});
