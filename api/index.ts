import type { XApiGroupedRegistry, XApiRegistry, XCallableApi } from '../src/shared/types';
import { block } from './action/block';
import { createBookmark } from './action/create-bookmark';
import { createRetweet } from './action/create-retweet';
import { createTweet } from './action/create-tweet';
import { deleteBookmark } from './action/delete-bookmark';
import { deleteRetweet } from './action/delete-retweet';
import { deleteTweet } from './action/delete-tweet';
import { favoriteTweet } from './action/favorite-tweet';
import { follow } from './action/follow';
import { grokTranslation } from './action/grok-translation';
import { removeFollower } from './action/remove-follower';
import { unfavoriteTweet } from './action/unfavorite-tweet';
import { unblock } from './action/unblock';
import { unfollow } from './action/unfollow';
import { bookmarks } from './query/bookmarks';
import { followList } from './query/follow-list';
import { followersYouFollow } from './query/followers-you-follow';
import { homeLatestTimeline } from './query/home-latest-timeline';
import { likes } from './query/likes';
import { notificationsTimeline } from './query/notifications-timeline';
import { tweetDetail } from './query/tweet-detail';
import { userTweets } from './query/user-tweets';
import { userTweetsAndReplies } from './query/user-tweets-and-replies';

export { deleteRetweet } from './action/delete-retweet';
export { deleteTweet } from './action/delete-tweet';
export { block } from './action/block';
export { createBookmark } from './action/create-bookmark';
export { createRetweet } from './action/create-retweet';
export { createTweet } from './action/create-tweet';
export { deleteBookmark } from './action/delete-bookmark';
export { favoriteTweet } from './action/favorite-tweet';
export { follow } from './action/follow';
export { grokTranslation } from './action/grok-translation';
export { removeFollower } from './action/remove-follower';
export { unfavoriteTweet } from './action/unfavorite-tweet';
export { unblock } from './action/unblock';
export { unfollow } from './action/unfollow';
export { bookmarks } from './query/bookmarks';
export { followList } from './query/follow-list';
export { followersYouFollow } from './query/followers-you-follow';
export { homeLatestTimeline } from './query/home-latest-timeline';
export { likes } from './query/likes';
export { notificationsTimeline } from './query/notifications-timeline';
export { tweetDetail } from './query/tweet-detail';
export { userTweets } from './query/user-tweets';
export { userTweetsAndReplies } from './query/user-tweets-and-replies';
export * from './action/delete-retweet/default';
export * from './action/delete-retweet/types';
export * from './action/delete-tweet/default';
export * from './action/delete-tweet/types';
export * from './action/block/default';
export * from './action/block/types';
export * from './action/create-bookmark/default';
export * from './action/create-bookmark/types';
export * from './action/create-retweet/default';
export * from './action/create-retweet/types';
export * from './action/create-tweet/default';
export * from './action/create-tweet/types';
export * from './action/delete-bookmark/default';
export * from './action/delete-bookmark/types';
export * from './action/favorite-tweet/default';
export * from './action/favorite-tweet/types';
export * from './action/follow/default';
export * from './action/follow/types';
export * from './action/grok-translation/default';
export * from './action/grok-translation/types';
export * from './action/remove-follower/default';
export * from './action/remove-follower/types';
export * from './action/unfavorite-tweet/default';
export * from './action/unfavorite-tweet/types';
export * from './action/unblock/default';
export * from './action/unblock/types';
export * from './action/unfollow/default';
export * from './action/unfollow/types';
export * from './query/bookmarks/default';
export * from './query/bookmarks/types';
export * from './query/follow-list/default';
export * from './query/follow-list/types';
export * from './query/followers-you-follow/default';
export * from './query/followers-you-follow/types';
export * from './query/home-latest-timeline/default';
export * from './query/home-latest-timeline/types';
export * from './query/likes/default';
export * from './query/likes/types';
export * from './query/notifications-timeline/default';
export * from './query/notifications-timeline/types';
export * from './query/tweet-detail/default';
export * from './query/tweet-detail/types';
export * from './query/user-tweets/default';
export * from './query/user-tweets/types';
export * from './query/user-tweets-and-replies/default';
export * from './query/user-tweets-and-replies/types';

export const builtInQueryApis: XApiRegistry = {
  bookmarks: bookmarks as XCallableApi<unknown, unknown>,
  homeLatestTimeline: homeLatestTimeline as XCallableApi<unknown, unknown>,
  likes: likes as XCallableApi<unknown, unknown>,
  notificationsTimeline: notificationsTimeline as XCallableApi<unknown, unknown>,
  tweetDetail: tweetDetail as XCallableApi<unknown, unknown>,
  userTweets: userTweets as XCallableApi<unknown, unknown>,
  userTweetsAndReplies: userTweetsAndReplies as XCallableApi<unknown, unknown>,
  followList: followList as XCallableApi<unknown, unknown>,
  followersYouFollow: followersYouFollow as XCallableApi<unknown, unknown>
};

export const builtInActionApis: XApiRegistry = {
  block: block as XCallableApi<unknown, unknown>,
  createBookmark: createBookmark as XCallableApi<unknown, unknown>,
  createRetweet: createRetweet as XCallableApi<unknown, unknown>,
  createTweet: createTweet as XCallableApi<unknown, unknown>,
  deleteBookmark: deleteBookmark as XCallableApi<unknown, unknown>,
  deleteRetweet: deleteRetweet as XCallableApi<unknown, unknown>,
  deleteTweet: deleteTweet as XCallableApi<unknown, unknown>,
  favoriteTweet: favoriteTweet as XCallableApi<unknown, unknown>,
  unfavoriteTweet: unfavoriteTweet as XCallableApi<unknown, unknown>,
  follow: follow as XCallableApi<unknown, unknown>,
  unfollow: unfollow as XCallableApi<unknown, unknown>,
  unblock: unblock as XCallableApi<unknown, unknown>,
  removeFollower: removeFollower as XCallableApi<unknown, unknown>,
  grokTranslation: grokTranslation as XCallableApi<unknown, unknown>
};

export const builtInApis: XApiRegistry = {
  ...builtInQueryApis,
  ...builtInActionApis
};

export function registerBuiltInApis(target: XApiGroupedRegistry): XApiGroupedRegistry {
  for (const [id, api] of Object.entries(builtInQueryApis)) {
    target.query[id] = api;
  }

  for (const [id, api] of Object.entries(builtInActionApis)) {
    target.action[id] = api;
  }

  return target;
}
