export type XShapeKind =
  | 'null'
  | 'boolean'
  | 'number'
  | 'string'
  | 'array'
  | 'object'
  | 'unknown';

export interface XShapeNode {
  kind: XShapeKind;
  element?: XShapeNode;
  properties?: Record<string, XShapeNode>;
  variants?: XShapeNode[];
  sample?: string | number | boolean | null;
}

export interface XUserRelationshipSummary {
  following?: boolean;
  followedBy?: boolean;
  blocking?: boolean;
  blockedBy?: boolean;
  muting?: boolean;
  wantRetweets?: boolean;
}

export interface XUserSummary {
  entryId?: string;
  sortIndex?: string;
  userId?: string;
  name?: string;
  screenName?: string;
  description?: string;
  location?: string;
  profileImageUrl?: string;
  verified?: boolean;
  protected?: boolean;
  followersCount?: number;
  friendsCount?: number;
  relationship?: XUserRelationshipSummary;
}

export interface XTweetStats {
  viewCount?: string;
  replyCount?: number;
  retweetCount?: number;
  likeCount?: number;
  quoteCount?: number;
  bookmarkCount?: number;
}

export interface XTweetViewerState {
  bookmarked?: boolean;
  favorited?: boolean;
  retweeted?: boolean;
}

export interface XTweetSummary {
  entryId?: string;
  sortIndex?: string;
  tweetId?: string;
  conversationId?: string;
  fullText?: string;
  createdAt?: string;
  language?: string;
  source?: string;
  inReplyToTweetId?: string;
  inReplyToUserId?: string;
  inReplyToScreenName?: string;
  quotedTweet?: XTweetSummary;
  user?: XUserSummary;
  stats?: XTweetStats;
  viewerState?: XTweetViewerState;
}

export interface XApiMatchRule {
  method?: string;
  path?: string;
  operationName?: string;
  variablesShapeHash?: string;
}

export type XApiPaginationStrategy = 'cursor';

export interface XApiPaginationDesc {
  strategy: XApiPaginationStrategy;
  countParam: string;
  cursorParam: string;
  nextCursorField: string;
  prevCursorField?: string;
  hasMoreField?: string;
  defaultCount?: number;
  minCount?: number;
  maxCount?: number;
}

export interface XApiMeta {
  id: string;
  title: string;
  match: XApiMatchRule;
  requestTypeName: string;
  responseTypeName: string;
  pagination?: XApiPaginationDesc;
}

export type XCallableApi<I = unknown, O = unknown, D = unknown> = ((input?: I) => Promise<O>) & {
  __desc: string;
  __default_params?: D;
  __meta: XApiMeta;
};

export type XApiRegistry = Record<string, XCallableApi<unknown, unknown>>;

export interface XApiGroupedRegistry {
  query: XApiRegistry;
  action: XApiRegistry;
}

export interface XGraphqlMeta {
  isGraphql: boolean;
  operationName?: string;
  query?: string;
  variables?: unknown;
  variablesShapeHash?: string;
}

export interface XUnknownApiInput {
  key: string;
  fingerprint: string;
  method: string;
  path: string;
  url: string;
  status?: number;
  isGraphql: boolean;
  operationName?: string;
  requestShape: XShapeNode;
  responseShape: XShapeNode;
  requestSample?: unknown;
  responseSample?: unknown;
  headers?: Record<string, string>;
  error?: string;
}

export interface XUnknownApiRecord extends XUnknownApiInput {
  firstSeen: string;
  lastSeen: string;
  hits: number;
}

export interface XUnknownApiStore {
  list(): XUnknownApiRecord[];
  get(key: string): XUnknownApiRecord | undefined;
  clear(): void;
  toJSON(pretty?: boolean): string;
}

export interface XUnknownApiWritableStore extends XUnknownApiStore {
  upsert(input: XUnknownApiInput): XUnknownApiRecord | undefined;
}

export interface XNamespace {
  api: XApiGroupedRegistry;
  selfUserId?: string;
  __unknown_api: XUnknownApiStore;
  paginateCursorApi: XPaginateCursorApi;
  collectCursorPages: XCollectCursorPages;
  [key: string]: unknown;
}

export interface XCursorPaginationRequest {
  count?: number;
  cursor?: string;
}

export interface XCursorPaginationResponse {
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
}

export interface XCursorPaginateOptions<O extends XCursorPaginationResponse = XCursorPaginationResponse> {
  direction?: 'next' | 'prev';
  count?: number;
  maxPages?: number;
  maxItems?: number;
  delayMs?: number;
  signal?: AbortSignal;
  extractItems?: (page: O) => unknown[];
}

export interface XCursorPaginateStep<O extends XCursorPaginationResponse = XCursorPaginationResponse> {
  page: O;
  pageIndex: number;
  cursorUsed?: string;
  nextCursor?: string;
  prevCursor?: string;
  itemCount: number;
  totalItemCount: number;
}

export interface XCursorCollectResult<O extends XCursorPaginationResponse = XCursorPaginationResponse> {
  pages: O[];
  items: unknown[];
  exhausted: boolean;
  pageCount: number;
  itemCount: number;
  nextCursor?: string;
  prevCursor?: string;
}

export type XPaginateCursorApi = <
  I extends XCursorPaginationRequest,
  O extends XCursorPaginationResponse
>(
  api: XCallableApi<I, O>,
  input: I,
  options?: XCursorPaginateOptions<O>
) => AsyncGenerator<XCursorPaginateStep<O>, void, void>;

export type XCollectCursorPages = <
  I extends XCursorPaginationRequest,
  O extends XCursorPaginationResponse
>(
  api: XCallableApi<I, O>,
  input: I,
  options?: XCursorPaginateOptions<O>
) => Promise<XCursorCollectResult<O>>;

declare global {
  interface Window {
    x?: XNamespace;
    __X_TWITTER_API_INTERCEPTOR_INSTALLED__?: boolean;
  }
}
