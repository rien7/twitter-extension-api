import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_FOLLOWERS_YOU_FOLLOW_ENDPOINT,
  DEFAULT_FOLLOWERS_YOU_FOLLOW_PARAMS
} from './default';

export const FOLLOWERS_YOU_FOLLOW_DESC_TEXT = [
  '[followers-you-follow]',
  'Purpose: Fetch accounts you follow who also follow the target user.',
  'Call: window.x.api.query.followersYouFollow(input?)',
  'Input:',
  '  Required:',
  '    - none (userId defaults to self from twid)',
  '  Optional:',
  '    - userId',
  '    - count',
  '    - cursor',
  '    - withTotalCount',
  '    - paramsOverride',
  'Pagination: count + cursor -> nextCursor / prevCursor / hasMore',
  'Returns: users, totalCount, nextCursor, prevCursor, hasMore, errors'
].join('\n');

const FOLLOWERS_YOU_FOLLOW_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_FOLLOWERS_YOU_FOLLOW_ENDPOINT,
  params: { ...DEFAULT_FOLLOWERS_YOU_FOLLOW_PARAMS }
});

export function getFollowersYouFollowDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(FOLLOWERS_YOU_FOLLOW_DEFAULT_PARAMS_TEMPLATE);
}

export const followersYouFollowMeta: XApiMeta = {
  id: 'followers-you-follow',
  title: 'Followers You Follow',
  match: {
    method: 'GET',
    path: '/i/api/1.1/friends/following/list.json'
  },
  requestTypeName: 'FollowersYouFollowRequest',
  responseTypeName: 'FollowersYouFollowResponse',
  pagination: {
    strategy: 'cursor',
    countParam: 'count',
    cursorParam: 'cursor',
    nextCursorField: 'nextCursor',
    prevCursorField: 'prevCursor',
    hasMoreField: 'hasMore',
    defaultCount: 3,
    minCount: 1,
    maxCount: 100
  }
};
