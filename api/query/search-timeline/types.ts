import type {
  XTweetStats,
  XTweetSummary,
  XTweetTimelineResponseBase,
  XTweetViewerState,
  XUserSummary
} from '../../../src/shared/types';

/**
 * SearchTimeline GraphQL operation name captured from live traffic.
 */
export type SearchTimelineOperationName = 'SearchTimeline';

/**
 * Search tab/product values observed in captured requests.
 */
export type SearchTimelineProduct = 'Top' | 'Latest' | 'People' | 'Media' | 'Lists';

/**
 * Request variables used by SearchTimeline GraphQL query.
 */
export interface SearchTimelineVariables {
  /** Raw search query text entered by user. */
  rawQuery: string;
  /** Number of timeline entries requested in a single page. */
  count: number;
  /** Query source marker used by X search client flow. */
  querySource: string;
  /** Search tab/product. */
  product: SearchTimelineProduct;
  /** Whether translated bio hints are requested in search results. */
  withGrokTranslatedBio: boolean;
  /** Cursor used for pagination. */
  cursor?: string;
}

/**
 * Known feature switches observed in SearchTimeline requests.
 * Additional feature flags may appear over time.
 */
export interface SearchTimelineFeatures {
  rweb_video_screen_enabled?: boolean;
  profile_label_improvements_pcf_label_in_post_enabled?: boolean;
  responsive_web_profile_redirect_enabled?: boolean;
  rweb_tipjar_consumption_enabled?: boolean;
  verified_phone_label_enabled?: boolean;
  creator_subscriptions_tweet_preview_api_enabled?: boolean;
  responsive_web_graphql_timeline_navigation_enabled?: boolean;
  responsive_web_graphql_skip_user_profile_image_extensions_enabled?: boolean;
  premium_content_api_read_enabled?: boolean;
  communities_web_enable_tweet_community_results_fetch?: boolean;
  c9s_tweet_anatomy_moderator_badge_enabled?: boolean;
  responsive_web_grok_analyze_button_fetch_trends_enabled?: boolean;
  responsive_web_grok_analyze_post_followups_enabled?: boolean;
  responsive_web_jetfuel_frame?: boolean;
  responsive_web_grok_share_attachment_enabled?: boolean;
  responsive_web_grok_annotations_enabled?: boolean;
  articles_preview_enabled?: boolean;
  responsive_web_edit_tweet_api_enabled?: boolean;
  graphql_is_translatable_rweb_tweet_is_translatable_enabled?: boolean;
  view_counts_everywhere_api_enabled?: boolean;
  longform_notetweets_consumption_enabled?: boolean;
  responsive_web_twitter_article_tweet_consumption_enabled?: boolean;
  tweet_awards_web_tipping_enabled?: boolean;
  content_disclosure_indicator_enabled?: boolean;
  content_disclosure_ai_generated_indicator_enabled?: boolean;
  responsive_web_grok_show_grok_translated_post?: boolean;
  responsive_web_grok_analysis_button_from_backend?: boolean;
  post_ctas_fetch_enabled?: boolean;
  freedom_of_speech_not_reach_fetch_enabled?: boolean;
  standardized_nudges_misinfo?: boolean;
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled?: boolean;
  longform_notetweets_rich_text_read_enabled?: boolean;
  longform_notetweets_inline_media_enabled?: boolean;
  responsive_web_grok_image_annotation_enabled?: boolean;
  responsive_web_grok_imagine_annotation_enabled?: boolean;
  responsive_web_grok_community_note_auto_translation_is_enabled?: boolean;
  responsive_web_enhance_cards_enabled?: boolean;
  [featureKey: string]: boolean | undefined;
}

/**
 * Public API input for search timeline.
 *
 * `rawQuery` is the required business field.
 */
export interface SearchTimelineRequest {
  /** Raw search query text. */
  rawQuery: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: SearchTimelineOperationName;
  /** GraphQL queryId/docId used in URL path. */
  queryId?: string;
  /** Convenience override for variables.count. */
  count?: number;
  /** Convenience override for variables.cursor. */
  cursor?: string;
  /** Convenience override for variables.querySource. */
  querySource?: string;
  /** Convenience override for variables.product. */
  product?: SearchTimelineProduct;
  /** Convenience override for variables.withGrokTranslatedBio. */
  withGrokTranslatedBio?: boolean;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<SearchTimelineVariables>;
  /** Partial feature overrides merged with defaults. */
  featuresOverride?: Partial<SearchTimelineFeatures>;
}

/**
 * Fully materialized request payload sent to SearchTimeline endpoint.
 */
export interface SearchTimelineResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: SearchTimelineOperationName;
  queryId: string;
  variables: SearchTimelineVariables;
  features: SearchTimelineFeatures;
}

/**
 * GraphQL error extension payload.
 */
export interface SearchTimelineGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface SearchTimelineGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: SearchTimelineGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface SearchTimelineOriginalResponse {
  data?: SearchTimelineData;
  errors?: SearchTimelineGraphQLError[];
}

/**
 * Normalized list summary for list-search product results.
 */
export interface SearchTimelineListSummary {
  entryId?: string;
  sortIndex?: string;
  listId?: string;
  name?: string;
  description?: string;
  mode?: string;
  following?: boolean;
  isMember?: boolean;
  muting?: boolean;
  memberCount?: number;
  subscriberCount?: number;
  owner?: XUserSummary;
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface SearchTimelineResponse
  extends XTweetTimelineResponseBase<
    SearchTimelineInstruction,
    SearchTimelineEntry,
    SearchTimelineOriginalResponse,
    SearchTimelineGraphQLError
  > {
  query: string;
  product: SearchTimelineProduct;
  querySource: string;
  users: SearchTimelineUserSummary[];
  lists: SearchTimelineListSummary[];
  conversationTweetIds: string[];
}

export interface SearchTimelineData {
  search_by_raw_query?: SearchTimelineByRawQuery;
}

export interface SearchTimelineByRawQuery {
  search_timeline?: SearchTimelineContainer;
  [key: string]: unknown;
}

export interface SearchTimelineContainer {
  timeline?: SearchTimelineTimeline;
  [key: string]: unknown;
}

export interface SearchTimelineTimeline {
  instructions?: SearchTimelineInstruction[];
  [key: string]: unknown;
}

export type SearchTimelineInstruction =
  | SearchTimelineAddEntriesInstruction
  | SearchTimelineAddToModuleInstruction
  | SearchTimelineReplaceEntryInstruction
  | SearchTimelineClearCacheInstruction
  | SearchTimelineTerminateTimelineInstruction
  | SearchTimelineUnknownInstruction;

export interface SearchTimelineAddEntriesInstruction {
  type: 'TimelineAddEntries';
  entries: SearchTimelineEntry[];
}

export interface SearchTimelineAddToModuleInstruction {
  type: 'TimelineAddToModule';
  moduleEntryId?: string;
  moduleItems: SearchTimelineModuleItem[];
}

export interface SearchTimelineReplaceEntryInstruction {
  type: 'TimelineReplaceEntry';
  entry_id_to_replace?: string;
  entry?: SearchTimelineEntry;
}

export interface SearchTimelineClearCacheInstruction {
  type: 'TimelineClearCache';
}

export interface SearchTimelineTerminateTimelineInstruction {
  type: 'TimelineTerminateTimeline';
  direction?: 'Top' | 'Bottom' | string;
}

export interface SearchTimelineUnknownInstruction {
  type?: string;
  direction?: string;
  entries?: SearchTimelineEntry[];
  moduleItems?: SearchTimelineModuleItem[];
  entry?: SearchTimelineEntry;
  [key: string]: unknown;
}

export interface SearchTimelineEntry {
  entryId: string;
  sortIndex?: string;
  content: SearchTimelineEntryContent;
}

export type SearchTimelineEntryContent =
  | SearchTimelineItemEntryContent
  | SearchTimelineCursorEntryContent
  | SearchTimelineModuleEntryContent
  | SearchTimelineUnknownEntryContent;

export interface SearchTimelineItemEntryContent {
  __typename?: 'TimelineTimelineItem' | string;
  entryType?: 'TimelineTimelineItem' | string;
  itemContent?: SearchTimelineTimelineItemContent;
  clientEventInfo?: SearchTimelineClientEventInfo;
}

export interface SearchTimelineCursorEntryContent {
  __typename?: 'TimelineTimelineCursor' | string;
  entryType?: 'TimelineTimelineCursor' | string;
  cursorType?: string;
  value?: string;
}

export interface SearchTimelineModuleEntryContent {
  __typename?: 'TimelineTimelineModule' | string;
  entryType?: 'TimelineTimelineModule' | string;
  items?: SearchTimelineModuleItem[];
  metadata?: SearchTimelineModuleMetadata;
  clientEventInfo?: SearchTimelineClientEventInfo;
}

export interface SearchTimelineUnknownEntryContent {
  __typename?: string;
  [key: string]: unknown;
}

export interface SearchTimelineClientEventInfo {
  component?: string;
  element?: string;
  details?: {
    timelinesDetails?: {
      injectionType?: string;
      controllerData?: string;
    };
  };
}

export interface SearchTimelineModuleMetadata {
  conversationMetadata?: {
    allTweetIds?: string[];
  };
  [key: string]: unknown;
}

export interface SearchTimelineModuleItem {
  entryId: string;
  item?: {
    itemContent?: SearchTimelineTimelineItemContent;
  };
}

export interface SearchTimelineTimelineItemContent {
  __typename?: string;
  itemType?: string;
  displayType?: string;
  tweetDisplayType?: string;
  userDisplayType?: string;
  tweet_results?: {
    result?: SearchTimelineTweetResult;
  };
  user_results?: {
    result?: SearchTimelineUser;
  };
  list?: SearchTimelineList;
}

export type SearchTimelineTweetResult =
  | SearchTimelineTweet
  | SearchTimelineTweetWithVisibilityResults
  | SearchTimelineTweetTombstone
  | SearchTimelineUnknownTweetResult;

export interface SearchTimelineTweetWithVisibilityResults {
  __typename?: 'TweetWithVisibilityResults' | string;
  tweet?: SearchTimelineTweet;
}

export interface SearchTimelineTweetTombstone {
  __typename?: 'TweetTombstone' | string;
  tombstone?: {
    text?: {
      text?: string;
    };
  };
}

export interface SearchTimelineUnknownTweetResult {
  __typename?: string;
  [key: string]: unknown;
}

export interface SearchTimelineTweet {
  __typename?: 'Tweet' | string;
  rest_id?: string;
  source?: string;
  core?: {
    user_results?: {
      result?: SearchTimelineUser;
    };
  };
  legacy?: SearchTimelineTweetLegacy;
  views?: {
    count?: string;
    state?: string;
  };
  quoted_status_result?: {
    result?: SearchTimelineTweetResult;
  };
  [key: string]: unknown;
}

export interface SearchTimelineTweetLegacy {
  conversation_id_str?: string;
  created_at?: string;
  full_text?: string;
  lang?: string;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id_str?: string;
  in_reply_to_screen_name?: string;
  quoted_status_id_str?: string;
  reply_count?: number;
  retweet_count?: number;
  favorite_count?: number;
  quote_count?: number;
  bookmark_count?: number;
  bookmarked?: boolean;
  favorited?: boolean;
  retweeted?: boolean;
  [key: string]: unknown;
}

export interface SearchTimelineUserRelationshipPerspectives {
  following?: boolean;
  followed_by?: boolean;
  blocking?: boolean;
  blocked_by?: boolean;
  muting?: boolean;
  want_retweets?: boolean;
  [key: string]: unknown;
}

export interface SearchTimelineUser {
  __typename?: 'User' | string;
  id?: string;
  rest_id?: string;
  core?: {
    name?: string;
    screen_name?: string;
  };
  avatar?: {
    image_url?: string;
  };
  legacy?: SearchTimelineUserLegacy;
  verification?: {
    verified?: boolean;
  };
  privacy?: {
    protected?: boolean;
  };
  relationship_perspectives?: SearchTimelineUserRelationshipPerspectives;
  [key: string]: unknown;
}

export interface SearchTimelineUserLegacy {
  name?: string;
  screen_name?: string;
  description?: string;
  location?: string;
  verified?: boolean;
  protected?: boolean;
  profile_image_url_https?: string;
  followers_count?: number;
  friends_count?: number;
  following?: boolean;
  followed_by?: boolean;
  blocking?: boolean;
  blocked_by?: boolean;
  muting?: boolean;
  want_retweets?: boolean;
  [key: string]: unknown;
}

export interface SearchTimelineList {
  id?: string | number;
  id_str?: string;
  name?: string;
  description?: string;
  mode?: string;
  following?: boolean;
  is_member?: boolean;
  muting?: boolean;
  member_count?: number;
  subscriber_count?: number;
  user_results?: {
    result?: SearchTimelineUser;
  };
  [key: string]: unknown;
}

export type SearchTimelineTweetSummary = XTweetSummary;

export type SearchTimelineUserSummary = XUserSummary;

export type SearchTimelineTweetStats = XTweetStats;

export type SearchTimelineViewerState = XTweetViewerState;
