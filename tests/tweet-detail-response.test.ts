import { afterEach, describe, expect, it, vi } from 'vitest';

import { tweetDetail } from '../api/query/tweet-detail';
import type { TweetDetailOriginalResponse } from '../api/query/tweet-detail/types';

describe('tweetDetail response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields and keeps full raw payload in __original', async () => {
    const rawPayload: TweetDetailOriginalResponse = {
      data: {
        threaded_conversation_with_injections_v2: {
          instructions: [
            {
              type: 'TimelineAddEntries',
              entries: [
                {
                  entryId: 'tweet-1',
                  sortIndex: '500',
                  content: {
                    __typename: 'TimelineTimelineItem',
                    itemContent: {
                      tweet_results: {
                        result: {
                          __typename: 'Tweet',
                          rest_id: '42',
                          source: 'web',
                          legacy: {
                            full_text: 'focal tweet',
                            created_at: 'Sun Feb 22 00:00:00 +0000 2026',
                            lang: 'en',
                            reply_count: 10,
                            retweet_count: 11,
                            favorite_count: 12,
                            quote_count: 13,
                            bookmark_count: 2,
                            bookmarked: true,
                            favorited: false,
                            retweeted: true
                          },
                          core: {
                            user_results: {
                              result: {
                                __typename: 'User',
                                rest_id: 'u42',
                                core: {
                                  name: 'Bob',
                                  screen_name: 'bob'
                                },
                                legacy: {
                                  profile_image_url_https: 'https://img.example/bob.jpg',
                                  verified: true
                                },
                                verification: {
                                  verified: true
                                }
                              }
                            }
                          },
                          views: {
                            count: '200'
                          }
                        }
                      }
                    }
                  }
                },
                {
                  entryId: 'module-1',
                  content: {
                    __typename: 'TimelineTimelineModule',
                    metadata: {
                      conversationMetadata: {
                        allTweetIds: ['42', '43']
                      }
                    },
                    items: [
                      {
                        entryId: 'module-item-1',
                        item: {
                          itemContent: {
                            tweet_results: {
                              result: {
                                __typename: 'TweetWithVisibilityResults',
                                tweet: {
                                  __typename: 'Tweet',
                                  rest_id: '43',
                                  source: 'web',
                                  legacy: {
                                    full_text: 'reply tweet',
                                    lang: 'en'
                                  },
                                  core: {
                                    user_results: {
                                      result: {
                                        __typename: 'User',
                                        rest_id: 'u43',
                                        core: {
                                          name: 'Carol',
                                          screen_name: 'carol'
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                },
                {
                  entryId: 'cursor-top',
                  content: {
                    __typename: 'TimelineTimelineCursor',
                    cursorType: 'Top',
                    value: 'cursor-top-token'
                  }
                }
              ]
            }
          ]
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

    const response = await tweetDetail({
      detailId: '42'
    });

    expect(response.instructions).toHaveLength(1);
    expect(response.entries).toHaveLength(3);
    expect(response.tweets).toHaveLength(2);
    expect(response.focalTweet?.tweetId).toBe('42');
    expect(response.cursorTop).toBe('cursor-top-token');
    expect(response.conversationTweetIds).toEqual(expect.arrayContaining(['42', '43']));
    expect(response.tweets[0].viewerState?.bookmarked).toBe(true);
    expect(response.__original).toEqual(rawPayload);
  });
});
