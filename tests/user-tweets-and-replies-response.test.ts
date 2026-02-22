import { afterEach, describe, expect, it, vi } from 'vitest';

import { userTweetsAndReplies } from '../api/query/user-tweets-and-replies';
import type { UserTweetsAndRepliesOriginalResponse } from '../api/query/user-tweets-and-replies/types';

describe('userTweetsAndReplies response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('extracts tweet summaries including visibility-wrapped tweets', async () => {
    const rawPayload: UserTweetsAndRepliesOriginalResponse = {
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
                        entryId: 'module-1',
                        sortIndex: '300',
                        content: {
                          __typename: 'TimelineTimelineModule',
                          metadata: {
                            conversationMetadata: {
                              allTweetIds: ['100', '101']
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
                                        rest_id: '100',
                                        source: 'web',
                                        legacy: {
                                          full_text: 'reply tweet',
                                          lang: 'en'
                                        },
                                        core: {
                                          user_results: {
                                            result: {
                                              __typename: 'User',
                                              rest_id: 'u100',
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

    const response = await userTweetsAndReplies({
      userId: '1882474049324081152'
    });

    expect(response.entries).toHaveLength(2);
    expect(response.tweets).toHaveLength(1);
    expect(response.tweets[0].tweetId).toBe('100');
    expect(response.cursorBottom).toBe('cursor-bottom-token');
    expect(response.nextCursor).toBe('cursor-bottom-token');
    expect(response.prevCursor).toBeUndefined();
    expect(response.hasMore).toBe(true);
    expect(response.conversationTweetIds).toEqual(expect.arrayContaining(['100', '101']));
    expect(response.__original).toEqual(rawPayload);
  });
});
