import { describe, expect, it } from 'vitest';

import { builtInActionApis, builtInQueryApis, registerBuiltInApis } from '../api';
import type { XApiGroupedRegistry } from '../src/shared/types';

describe('api registry grouping', () => {
  it('exposes built-in APIs by query/action with lowerCamelCase keys', () => {
    expect(builtInQueryApis.bookmarks).toBeDefined();
    expect(builtInQueryApis.homeLatestTimeline).toBeDefined();
    expect(builtInQueryApis.followList).toBeDefined();
    expect(builtInQueryApis.followersYouFollow).toBeDefined();
    expect(builtInQueryApis.notificationsTimeline).toBeDefined();
    expect(builtInQueryApis.searchTimeline).toBeDefined();
    expect(builtInQueryApis.userByScreenName).toBeDefined();
    expect(builtInActionApis.block).toBeDefined();
    expect(builtInActionApis.createBookmark).toBeDefined();
    expect(builtInActionApis.createRetweet).toBeDefined();
    expect(builtInActionApis.createTweet).toBeDefined();
    expect(builtInActionApis.deleteBookmark).toBeDefined();
    expect(builtInActionApis.deleteTweet).toBeDefined();
    expect(builtInActionApis.favoriteTweet).toBeDefined();
    expect(builtInActionApis.grokTranslation).toBeDefined();
    expect(builtInActionApis.removeFollower).toBeDefined();
    expect(builtInActionApis.unfollow).toBeDefined();
    expect(builtInActionApis.unblock).toBeDefined();
  });

  it('registers grouped APIs into query/action registries', () => {
    const target = {
      query: {},
      action: {}
    } as XApiGroupedRegistry & Record<string, unknown>;

    registerBuiltInApis(target);

    expect(target.query.bookmarks).toBeDefined();
    expect(target.query.homeLatestTimeline).toBeDefined();
    expect(target.query.followersYouFollow).toBeDefined();
    expect(target.query.notificationsTimeline).toBeDefined();
    expect(target.query.searchTimeline).toBeDefined();
    expect(target.query.userByScreenName).toBeDefined();
    expect(target.query['home-latest-timeline']).toBeUndefined();
    expect(target.action.block).toBeDefined();
    expect(target.action.createBookmark).toBeDefined();
    expect(target.action.createRetweet).toBeDefined();
    expect(target.action.createTweet).toBeDefined();
    expect(target.action.deleteBookmark).toBeDefined();
    expect(target.action.deleteTweet).toBeDefined();
    expect(target.action.favoriteTweet).toBeDefined();
    expect(target.action.grokTranslation).toBeDefined();
    expect(target.action.removeFollower).toBeDefined();
    expect(target.action.unfollow).toBeDefined();
  });
});
