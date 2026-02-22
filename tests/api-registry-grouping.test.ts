import { describe, expect, it } from 'vitest';

import { builtInActionApis, builtInQueryApis, registerBuiltInApis } from '../api';
import type { XApiGroupedRegistry } from '../src/shared/types';

describe('api registry grouping', () => {
  it('exposes built-in APIs by query/action with lowerCamelCase keys', () => {
    expect(builtInQueryApis.homeLatestTimeline).toBeDefined();
    expect(builtInQueryApis.followList).toBeDefined();
    expect(builtInActionApis.block).toBeDefined();
    expect(builtInActionApis.deleteTweet).toBeDefined();
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

    expect(target.query.homeLatestTimeline).toBeDefined();
    expect(target.query['home-latest-timeline']).toBeUndefined();
    expect(target.action.block).toBeDefined();
    expect(target.action.deleteTweet).toBeDefined();
    expect(target.action.removeFollower).toBeDefined();
    expect(target.action.unfollow).toBeDefined();
  });
});
