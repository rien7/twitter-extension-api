import { afterEach, describe, expect, it, vi } from 'vitest';

import { searchTimeline } from '../api/query/search-timeline';
import type { SearchTimelineOriginalResponse } from '../api/query/search-timeline/types';

describe('searchTimeline response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns normalized fields for tweets/users/lists and keeps full payload in __original', async () => {
    const rawPayload: SearchTimelineOriginalResponse = {
      data: {
        search_by_raw_query: {
          search_timeline: {
            timeline: {
              instructions: [
                {
                  type: 'TimelineAddEntries',
                  entries: [
                    {
                      entryId: 'tweet-42',
                      sortIndex: '101',
                      content: {
                        __typename: 'TimelineTimelineItem',
                        entryType: 'TimelineTimelineItem',
                        itemContent: {
                          __typename: 'TimelineTweet',
                          itemType: 'TimelineTweet',
                          tweet_results: {
                            result: {
                              __typename: 'Tweet',
                              rest_id: '42',
                              source: 'web',
                              legacy: {
                                full_text: 'first search tweet',
                                created_at: 'Sun Feb 22 00:00:00 +0000 2026',
                                lang: 'en',
                                conversation_id_str: '42',
                                in_reply_to_screen_name: 'alice',
                                quoted_status_id_str: '42',
                                reply_count: 1,
                                retweet_count: 2,
                                favorite_count: 3,
                                quote_count: 4,
                                bookmark_count: 5,
                                bookmarked: true,
                                favorited: false,
                                retweeted: true
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
                                      followers_count: 10,
                                      friends_count: 20,
                                      verified: true,
                                      profile_image_url_https: 'https://img/alice.jpg'
                                    },
                                    verification: {
                                      verified: true
                                    },
                                    relationship_perspectives: {
                                      following: true,
                                      followed_by: false,
                                      blocking: false,
                                      blocked_by: false,
                                      muting: false
                                    }
                                  }
                                }
                              },
                              views: {
                                count: '88'
                              },
                              quoted_status_result: {
                                result: {
                                  __typename: 'Tweet',
                                  rest_id: '42',
                                  legacy: {
                                    full_text: 'quoted tweet text'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    {
                      entryId: 'user-u2',
                      sortIndex: '100',
                      content: {
                        __typename: 'TimelineTimelineItem',
                        entryType: 'TimelineTimelineItem',
                        itemContent: {
                          __typename: 'TimelineUser',
                          itemType: 'TimelineUser',
                          user_results: {
                            result: {
                              __typename: 'User',
                              rest_id: 'u2',
                              core: {
                                name: 'Bob',
                                screen_name: 'bob'
                              },
                              legacy: {
                                description: 'bio',
                                location: 'Earth',
                                followers_count: 7,
                                friends_count: 8
                              },
                              relationship_perspectives: {
                                following: false,
                                followed_by: true,
                                blocking: false,
                                blocked_by: false,
                                muting: true
                              }
                            }
                          }
                        }
                      }
                    },
                    {
                      entryId: 'list-search-0',
                      sortIndex: '99',
                      content: {
                        __typename: 'TimelineTimelineModule',
                        entryType: 'TimelineTimelineModule',
                        metadata: {
                          conversationMetadata: {
                            allTweetIds: ['42']
                          }
                        },
                        items: [
                          {
                            entryId: 'list-1',
                            item: {
                              itemContent: {
                                __typename: 'TimelineTwitterList',
                                itemType: 'TimelineTwitterList',
                                list: {
                                  id_str: '900',
                                  name: 'SDK List',
                                  description: 'list description',
                                  mode: 'Public',
                                  member_count: 12,
                                  subscriber_count: 34,
                                  following: true,
                                  is_member: false,
                                  muting: false,
                                  user_results: {
                                    result: {
                                      __typename: 'User',
                                      rest_id: 'u3',
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
                        ]
                      }
                    },
                    {
                      entryId: 'cursor-bottom-1',
                      content: {
                        __typename: 'TimelineTimelineCursor',
                        entryType: 'TimelineTimelineCursor',
                        cursorType: 'Bottom',
                        value: 'cursor-bottom-token'
                      }
                    }
                  ]
                },
                {
                  type: 'TimelineAddToModule',
                  moduleEntryId: 'search-grid-0',
                  moduleItems: [
                    {
                      entryId: 'tweet-media',
                      item: {
                        itemContent: {
                          __typename: 'TimelineTweet',
                          itemType: 'TimelineTweet',
                          tweet_results: {
                            result: {
                              __typename: 'Tweet',
                              source: 'web',
                              legacy: {
                                full_text: 'media tweet',
                                created_at: 'Sun Feb 22 01:00:00 +0000 2026',
                                lang: 'en',
                                reply_count: 0,
                                retweet_count: 1,
                                favorite_count: 2,
                                quote_count: 0,
                                bookmark_count: 0
                              },
                              views: {
                                count: '12'
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                },
                {
                  type: 'TimelineReplaceEntry',
                  entry_id_to_replace: 'cursor-top-old',
                  entry: {
                    entryId: 'cursor-top-new',
                    content: {
                      __typename: 'TimelineTimelineCursor',
                      entryType: 'TimelineTimelineCursor',
                      cursorType: 'Top',
                      value: 'cursor-top-token'
                    }
                  }
                }
              ]
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

    const response = await searchTimeline({
      rawQuery: 'hello world',
      product: 'People',
      count: 20
    });

    expect(response.query).toBe('hello world');
    expect(response.product).toBe('People');
    expect(response.querySource).toBe('typed_query');
    expect(response.entries.length).toBeGreaterThanOrEqual(4);

    expect(response.tweets).toHaveLength(2);
    expect(response.tweets[0].tweetId).toBe('42');
    expect(response.tweets[0].quotedTweet?.tweetId).toBe('42');
    expect(response.tweets[0].stats?.viewCount).toBe('88');

    expect(response.users).toHaveLength(1);
    expect(response.users[0].userId).toBe('u2');
    expect(response.users[0].relationship?.followedBy).toBe(true);

    expect(response.lists).toHaveLength(1);
    expect(response.lists[0].listId).toBe('900');
    expect(response.lists[0].owner?.userId).toBe('u3');

    expect(response.cursorBottom).toBe('cursor-bottom-token');
    expect(response.nextCursor).toBe('cursor-bottom-token');
    expect(response.cursorTop).toBe('cursor-top-token');
    expect(response.prevCursor).toBe('cursor-top-token');
    expect(response.hasMore).toBe(true);

    expect(response.conversationTweetIds).toContain('42');
    expect(response.__original).toEqual(rawPayload);
  });
});
