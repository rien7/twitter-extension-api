import type { XTweetSummary, XUserSummary } from '../../../src/shared/types';

/**
 * Bookmarks GraphQL operation name captured from live traffic.
 */
export type BookmarksOperationName = 'Bookmarks';

/**
 * Request variables used by Bookmarks GraphQL query.
 */
export interface BookmarksVariables {
  /** Number of timeline entries requested in a single page. */
  count: number;
  /** Whether promoted entries are included in timeline output. */
  includePromotedContent: boolean;
  /** Cursor used for pagination. */
  cursor?: string;
}

/**
 * Known feature switches observed in Bookmarks requests.
 * Additional feature flags may appear over time.
 */
export interface BookmarksFeatures {
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
 * Public API input for bookmarks timeline.
 */
export interface BookmarksRequest {
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: BookmarksOperationName;
  /** GraphQL queryId/docId used in URL path. */
  queryId?: string;
  /** Convenience override for variables.count. */
  count?: number;
  /** Convenience override for variables.includePromotedContent. */
  includePromotedContent?: boolean;
  /** Convenience override for variables.cursor. */
  cursor?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<BookmarksVariables>;
  /** Partial feature overrides merged with defaults. */
  featuresOverride?: Partial<BookmarksFeatures>;
}

/**
 * Fully materialized request payload sent to Bookmarks endpoint.
 */
export interface BookmarksResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: BookmarksOperationName;
  queryId: string;
  variables: BookmarksVariables;
  features: BookmarksFeatures;
}

/**
 * GraphQL error extension payload.
 */
export interface BookmarksGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface BookmarksGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: BookmarksGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface BookmarksOriginalResponse {
  data?: BookmarksData;
  errors?: BookmarksGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface BookmarksResponse {
  instructions: BookmarksInstruction[];
  entries: BookmarksEntry[];
  tweets: BookmarksTweetSummary[];
  cursorTop?: string;
  cursorBottom?: string;
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  conversationTweetIds: string[];
  errors?: BookmarksGraphQLError[];
  __original: BookmarksOriginalResponse;
}

export interface BookmarksData {
  bookmark_timeline_v2?: BookmarksTimelineV2;
}

export interface BookmarksTimelineV2 {
  timeline?: BookmarksTimeline;
  [key: string]: unknown;
}

export interface BookmarksTimeline {
  instructions?: BookmarksInstruction[];
  responseObjects?: BookmarksResponseObjects;
  [key: string]: unknown;
}

export interface BookmarksResponseObjects {
  feedbackActions?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export type BookmarksInstruction =
  | BookmarksAddEntriesInstruction
  | BookmarksClearCacheInstruction
  | BookmarksTerminateTimelineInstruction
  | BookmarksUnknownInstruction;

export interface BookmarksAddEntriesInstruction {
  type: 'TimelineAddEntries';
  entries: BookmarksEntry[];
}

export interface BookmarksClearCacheInstruction {
  type: 'TimelineClearCache';
}

export interface BookmarksTerminateTimelineInstruction {
  type: 'TimelineTerminateTimeline';
  direction?: 'Top' | 'Bottom' | string;
}

export interface BookmarksUnknownInstruction {
  type?: string;
  direction?: string;
  entries?: BookmarksEntry[];
  [key: string]: unknown;
}

export interface BookmarksEntry {
  entryId: string;
  sortIndex?: string;
  content: BookmarksEntryContent;
}

export type BookmarksEntryContent =
  | BookmarksItemEntryContent
  | BookmarksCursorEntryContent
  | BookmarksModuleEntryContent
  | BookmarksUnknownEntryContent;

export interface BookmarksItemEntryContent {
  __typename?: 'TimelineTimelineItem' | string;
  entryType?: 'TimelineTimelineItem' | string;
  itemContent?: BookmarksTimelineItemContent;
  clientEventInfo?: BookmarksClientEventInfo;
}

export interface BookmarksCursorEntryContent {
  __typename?: 'TimelineTimelineCursor' | string;
  entryType?: 'TimelineTimelineCursor' | string;
  cursorType?: string;
  value?: string;
}

export interface BookmarksModuleEntryContent {
  __typename?: 'TimelineTimelineModule' | string;
  entryType?: 'TimelineTimelineModule' | string;
  items?: BookmarksModuleItem[];
  metadata?: BookmarksModuleMetadata;
  clientEventInfo?: BookmarksClientEventInfo;
}

export interface BookmarksUnknownEntryContent {
  __typename?: string;
  [key: string]: unknown;
}

export interface BookmarksClientEventInfo {
  component?: string;
  element?: string;
  details?: {
    timelinesDetails?: {
      injectionType?: string;
      controllerData?: string;
    };
  };
}

export interface BookmarksModuleMetadata {
  conversationMetadata?: {
    allTweetIds?: string[];
  };
  [key: string]: unknown;
}

export interface BookmarksModuleItem {
  entryId: string;
  item?: {
    itemContent?: BookmarksTimelineItemContent;
  };
}

export interface BookmarksTimelineItemContent {
  __typename?: 'TimelineTweet' | string;
  itemType?: 'TimelineTweet' | string;
  tweetDisplayType?: string;
  tweet_results?: {
    result?: BookmarksTweetResult;
  };
}

export type BookmarksTweetResult =
  | BookmarksTweet
  | BookmarksTweetWithVisibilityResults
  | BookmarksTweetTombstone
  | BookmarksUnknownTweetResult;

export interface BookmarksTweet {
  __typename?: 'Tweet' | string;
  rest_id?: string;
  source?: string;
  core?: {
    user_results?: {
      result?: BookmarksUser;
    };
  };
  legacy?: BookmarksTweetLegacy;
  views?: {
    count?: string;
    state?: string;
  };
  [key: string]: unknown;
}

export interface BookmarksTweetWithVisibilityResults {
  __typename?: 'TweetWithVisibilityResults' | string;
  tweet?: BookmarksTweet;
  [key: string]: unknown;
}

export interface BookmarksTweetTombstone {
  __typename?: 'TweetTombstone' | string;
  tombstone?: {
    text?: {
      text?: string;
      entities?: Array<Record<string, unknown>>;
    };
  };
  [key: string]: unknown;
}

export interface BookmarksUnknownTweetResult {
  __typename?: string;
  [key: string]: unknown;
}

export interface BookmarksTweetLegacy {
  created_at?: string;
  full_text?: string;
  lang?: string;
  conversation_id_str?: string;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id_str?: string;
  bookmark_count?: number;
  favorite_count?: number;
  quote_count?: number;
  reply_count?: number;
  retweet_count?: number;
  bookmarked?: boolean;
  favorited?: boolean;
  retweeted?: boolean;
  [key: string]: unknown;
}

export interface BookmarksUser {
  __typename?: 'User' | string;
  id?: string;
  rest_id?: string;
  core?: {
    name?: string;
    screen_name?: string;
  };
  legacy?: BookmarksUserLegacy;
  avatar?: {
    image_url?: string;
  };
  verification?: {
    verified?: boolean;
  };
  [key: string]: unknown;
}

export interface BookmarksUserLegacy {
  name?: string;
  screen_name?: string;
  verified?: boolean;
  profile_image_url_https?: string;
  [key: string]: unknown;
}

export interface BookmarksTweetSummary extends XTweetSummary {
  user?: XUserSummary;
}
