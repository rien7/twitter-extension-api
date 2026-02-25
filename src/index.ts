import { registerBuiltInApis } from '../api';
import { installNetworkInterceptors } from './page/interceptor';
import { ensureUnknownApiStore, ensureXNamespace } from './sdk/global';
import { collectCursorPages, paginateCursorApi } from './sdk/pagination';
import { getSelfUserId, initializeSelfUserIdFromCookie } from './sdk/self-user-id';

export type {
  XApiMatchRule,
  XApiMeta,
  XApiGroupedRegistry,
  XApiPaginationDesc,
  XApiPaginationStrategy,
  XApiRegistry,
  XActionResponseBase,
  XCollectCursorPages,
  XCallableApi,
  XCursorPageSummary,
  XCursorCollectResult,
  XCursorPaginateOptions,
  XCursorPaginateStep,
  XCursorPaginationRequest,
  XCursorPaginationResponse,
  XGraphqlMeta,
  XNamespace,
  XPaginateCursorApi,
  XResponseBase,
  XShapeNode,
  XTargetTweetActionResponseBase,
  XTargetUserActionResponseBase,
  XTweetTimelineResponseBase,
  XTweetStats,
  XTweetSummary,
  XTweetViewerState,
  XUserTimelineResponseBase,
  XUnknownApiInput,
  XUnknownApiRecord,
  XUnknownApiStore,
  XUserRelationshipSummary,
  XUserSummary
} from './shared/types';

export {
  hashShape,
  hashString,
  inferShape,
  normalizeMethod,
  normalizePath,
  redactSensitiveData,
  sanitizeHeaders
} from './shared/shape';

export { detectGraphqlMeta } from './page/graphql';
export {
  buildGraphqlHeaders,
  buildGraphqlHeadersForRequest,
  getLatestGraphqlHeaders,
  setLatestGraphqlHeaders
} from './sdk/request-headers';
export { collectCursorPages, paginateCursorApi };
export { extractUserIdFromTwidValue, getSelfUserId, initializeSelfUserIdFromCookie } from './sdk/self-user-id';
export {
  builtInActionApis,
  builtInQueryApis,
  builtInApis,
  block,
  createBookmark,
  createRetweet,
  deleteBookmark,
  deleteRetweet,
  deleteTweet,
  favoriteTweet,
  follow,
  followList,
  removeFollower,
  homeLatestTimeline,
  likes,
  registerBuiltInApis,
  tweetDetail,
  userByScreenName,
  unfavoriteTweet,
  unblock,
  unfollow,
  userTweets,
  userTweetsAndReplies
} from '../api';

export function bootstrapTwitterExtensionApiSdk() {
  if (typeof window === 'undefined') {
    throw new Error('bootstrapTwitterExtensionApiSdk can only run in browser context.');
  }

  initializeSelfUserIdFromCookie();
  const namespace = ensureXNamespace();
  const selfUserId = getSelfUserId();
  if (selfUserId) {
    namespace.selfUserId = selfUserId;
  }
  namespace.paginateCursorApi = paginateCursorApi;
  namespace.collectCursorPages = collectCursorPages;
  registerBuiltInApis(namespace.api);
  ensureUnknownApiStore(namespace);
  installNetworkInterceptors({ namespace });

  return namespace;
}

export const initTwitterExtensionApiSdk = bootstrapTwitterExtensionApiSdk;
