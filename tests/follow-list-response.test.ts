import { afterEach, describe, expect, it, vi } from 'vitest';

import { followList } from '../api/query/follow-list';
import type { FollowListOriginalResponse } from '../api/query/follow-list/types';

describe('followList response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('lifts common fields and keeps full raw payload in __original', async () => {
    const rawPayload: FollowListOriginalResponse = {
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
                        entryId: 'user-1',
                        sortIndex: '100',
                        content: {
                          __typename: 'TimelineTimelineItem',
                          itemContent: {
                            __typename: 'TimelineUser',
                            user_results: {
                              result: {
                                __typename: 'User',
                                rest_id: 'u1',
                                core: {
                                  name: 'Alice',
                                  screen_name: 'alice'
                                },
                                legacy: {
                                  description: 'bio',
                                  followers_count: 10,
                                  friends_count: 20
                                },
                                relationship_perspectives: {
                                  following: true,
                                  followed_by: true,
                                  blocking: false,
                                  blocked_by: false,
                                  muting: false
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

    const response = await followList({
      userId: '42'
    });

    expect(response.instructions).toHaveLength(1);
    expect(response.entries).toHaveLength(3);
    expect(response.users).toHaveLength(1);
    expect(response.users[0].userId).toBe('u1');
    expect(response.users[0].screenName).toBe('alice');
    expect(response.nextCursor).toBe('cursor-bottom-token');
    expect(response.prevCursor).toBe('cursor-top-token');
    expect(response.hasMore).toBe(true);
    expect(response.__original).toEqual(rawPayload);
  });
});
