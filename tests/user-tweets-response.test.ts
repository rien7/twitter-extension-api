import { afterEach, describe, expect, it, vi } from 'vitest';

import { userTweets } from '../api/query/user-tweets';
import type { UserTweetsOriginalResponse } from '../api/query/user-tweets/types';

describe('userTweets response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields from entries and modules', async () => {
    const rawPayload: UserTweetsOriginalResponse = {
      data: {
        user: {
          result: {
            __typename: 'User',
            timeline: {
              timeline: {
                instructions: [
                  {
                    type: 'TimelineClearCache'
                  },
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
                                  full_text: 'profile tweet',
                                  lang: 'en'
                                },
                                core: {
                                  user_results: {
                                    result: {
                                      __typename: 'User',
                                      rest_id: 'u42',
                                      core: {
                                        name: 'Bob',
                                        screen_name: 'bob'
                                      }
                                    }
                                  }
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
                                      __typename: 'Tweet',
                                      rest_id: '43',
                                      source: 'web',
                                      legacy: {
                                        full_text: 'module tweet',
                                        lang: 'en'
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

    const response = await userTweets({
      userId: '42'
    });

    expect(response.instructions).toHaveLength(2);
    expect(response.entries).toHaveLength(3);
    expect(response.tweets).toHaveLength(2);
    expect(response.cursorTop).toBe('cursor-top-token');
    expect(response.prevCursor).toBe('cursor-top-token');
    expect(response.nextCursor).toBeUndefined();
    expect(response.hasMore).toBe(false);
    expect(response.conversationTweetIds).toEqual(expect.arrayContaining(['42', '43']));
    expect(response.__original).toEqual(rawPayload);
  });
});
