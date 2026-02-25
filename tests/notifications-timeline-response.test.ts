import { afterEach, describe, expect, it, vi } from 'vitest';

import { notificationsTimeline } from '../api/query/notifications-timeline';
import type { NotificationsTimelineOriginalResponse } from '../api/query/notifications-timeline/types';

describe('notifications-timeline response normalization', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns normalized fields and keeps full payload in __original', async () => {
    const rawPayload: NotificationsTimelineOriginalResponse = {
      data: {
        viewer_v2: {
          user_results: {
            result: {
              __typename: 'User',
              rest_id: 'u1',
              notification_timeline: {
                id: 'timeline-1',
                timeline: {
                  instructions: [
                    {
                      type: 'TimelineAddEntries',
                      entries: [
                        {
                          entryId: 'cursor-top',
                          sortIndex: '300',
                          content: {
                            __typename: 'TimelineTimelineCursor',
                            entryType: 'TimelineTimelineCursor',
                            cursorType: 'Top',
                            value: 'cursor-top-token'
                          }
                        },
                        {
                          entryId: 'notification-1',
                          sortIndex: '200',
                          content: {
                            __typename: 'TimelineTimelineItem',
                            entryType: 'TimelineTimelineItem',
                            itemContent: {
                              __typename: 'TimelineNotification',
                              itemType: 'TimelineNotification',
                              id: 'notif-1',
                              notification_icon: 'heart_icon',
                              timestamp_ms: '1700000000000',
                              notification_url: {
                                url: 'https://twitter.com/rien7z/status/42',
                                urlType: 'ExternalUrl'
                              },
                              rich_message: {
                                text: 'Someone liked your post',
                                rtl: false,
                                entities: []
                              },
                              template: {
                                __typename: 'TimelineNotificationAggregateUserActions',
                                from_users: [
                                  {
                                    user_results: {
                                      result: {
                                        __typename: 'User',
                                        rest_id: 'u2',
                                        core: {
                                          name: 'Alice',
                                          screen_name: 'alice'
                                        },
                                        verification: {
                                          verified: true
                                        },
                                        avatar: {
                                          image_url: 'https://example.com/u2.jpg'
                                        }
                                      }
                                    }
                                  }
                                ],
                                target_objects: [
                                  {
                                    __typename: 'TimelineNotificationTweetRef',
                                    tweet_results: {
                                      result: {
                                        __typename: 'Tweet',
                                        rest_id: '42'
                                      }
                                    }
                                  }
                                ]
                              }
                            }
                          }
                        },
                        {
                          entryId: 'tweet-1',
                          sortIndex: '100',
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
                                    full_text: 'hello',
                                    created_at: 'Sun Feb 22 00:00:00 +0000 2026',
                                    lang: 'en',
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
                                        rest_id: 'u2',
                                        core: {
                                          name: 'Alice',
                                          screen_name: 'alice'
                                        }
                                      }
                                    }
                                  },
                                  views: {
                                    count: '88'
                                  }
                                }
                              }
                            }
                          }
                        },
                        {
                          entryId: 'cursor-bottom',
                          sortIndex: '50',
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
                      type: 'TimelineClearEntriesUnreadState'
                    },
                    {
                      type: 'TimelineMarkEntriesUnreadGreaterThanSortIndex',
                      sort_index: '250'
                    }
                  ]
                }
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

    const response = await notificationsTimeline({
      count: 20
    });

    expect(response.timelineId).toBe('timeline-1');
    expect(response.viewerUserId).toBe('u1');
    expect(response.entries).toHaveLength(4);
    expect(response.notifications).toHaveLength(1);
    expect(response.notifications[0].notificationId).toBe('notif-1');
    expect(response.notifications[0].fromUsers[0].screenName).toBe('alice');
    expect(response.notifications[0].targetTweetIds).toContain('42');
    expect(response.tweets).toHaveLength(1);
    expect(response.tweets[0].tweetId).toBe('42');
    expect(response.tweets[0].stats?.likeCount).toBe(3);
    expect(response.cursorBottom).toBe('cursor-bottom-token');
    expect(response.nextCursor).toBe('cursor-bottom-token');
    expect(response.prevCursor).toBe('cursor-top-token');
    expect(response.hasMore).toBe(true);
    expect(response.unreadMarkerSortIndex).toBe('250');
    expect(response.clearedUnreadState).toBe(true);
    expect(response.__original).toEqual(rawPayload);
  });
});
