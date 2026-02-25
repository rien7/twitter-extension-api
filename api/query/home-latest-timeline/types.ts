import type {
  XTweetStats,
  XTweetSummary,
  XTweetTimelineResponseBase,
  XUserSummary
} from '../../../src/shared/types';

/**
 * HomeLatestTimeline GraphQL operation name captured from live traffic.
 */
export type HomeLatestTimelineOperationName = 'HomeLatestTimeline';

/**
 * Request variables used by HomeLatestTimeline.
 */
export interface HomeLatestTimelineVariables {
  /** Number of timeline entries expected in one request. */
  count: number;
  /** Whether ranking algorithm should be enabled for this request. */
  enableRanking: boolean;
  /** Whether promoted tweets should be included. */
  includePromotedContent: boolean;
  /** Request source context seen in real traffic, usually `launch`. */
  requestContext: string;
  /** Tweet IDs already seen by current client. */
  seenTweetIds: string[];
  /** Cursor used when requesting next page. */
  cursor?: string;
}

/**
 * Known feature switches observed in HomeLatestTimeline requests.
 * Extra feature flags may appear over time.
 */
export interface HomeLatestTimelineFeatures {
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
 * Public API input with a minimum-parameter style.
 *
 * - For common calls, callers can provide nothing or a few fields.
 * - For advanced usage, callers can override `variablesOverride` and `featuresOverride`.
 */
export interface HomeLatestTimelineRequest {
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into the default Twitter GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: HomeLatestTimelineOperationName;
  /** GraphQL queryId/docId used in URL path. */
  queryId?: string;
  /** Convenience override for variables.count. */
  count?: number;
  /** Convenience override for variables.enableRanking. */
  enableRanking?: boolean;
  /** Convenience override for variables.includePromotedContent. */
  includePromotedContent?: boolean;
  /** Convenience override for variables.requestContext. */
  requestContext?: string;
  /** Convenience override for variables.seenTweetIds. */
  seenTweetIds?: string[];
  /** Convenience override for variables.cursor. */
  cursor?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<HomeLatestTimelineVariables>;
  /** Partial feature overrides merged with defaults. */
  featuresOverride?: Partial<HomeLatestTimelineFeatures>;
}

/**
 * Fully materialized request payload sent to Twitter GraphQL endpoint.
 */
export interface HomeLatestTimelineResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: HomeLatestTimelineOperationName;
  queryId: string;
  variables: HomeLatestTimelineVariables;
  features: HomeLatestTimelineFeatures;
}

/**
 * Standard GraphQL error payload.
 */
export interface HomeLatestTimelineGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface HomeLatestTimelineOriginalResponse {
  data?: HomeLatestTimelineData;
  errors?: HomeLatestTimelineGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 *
 * - Frequently-used branches are lifted to top-level fields.
 * - Full raw payload is preserved under `__original`.
 */
export interface HomeLatestTimelineResponse
  extends XTweetTimelineResponseBase<
    HomeLatestTimelineInstruction,
    HomeLatestTimelineEntry,
    HomeLatestTimelineOriginalResponse,
    HomeLatestTimelineGraphQLError
  > {
  scribePage?: string;
}

export interface HomeLatestTimelineData {
  home?: HomeLatestTimelineHome;
}

export interface HomeLatestTimelineHome {
  home_timeline_urt?: HomeLatestTimelineUrt;
}

export interface HomeLatestTimelineUrt {
  instructions?: HomeLatestTimelineInstruction[];
  metadata?: HomeLatestTimelineMetadata;
}

export interface HomeLatestTimelineMetadata {
  scribeConfig?: {
    page?: string;
  };
}

export type HomeLatestTimelineInstruction =
  | HomeLatestTimelineAddEntriesInstruction
  | HomeLatestTimelineClearCacheInstruction
  | HomeLatestTimelineUnknownInstruction;

export interface HomeLatestTimelineAddEntriesInstruction {
  type: 'TimelineAddEntries';
  entries: HomeLatestTimelineEntry[];
}

export interface HomeLatestTimelineClearCacheInstruction {
  type: 'TimelineClearCache';
}

export interface HomeLatestTimelineUnknownInstruction {
  type?: string;
  entries?: HomeLatestTimelineEntry[];
  [key: string]: unknown;
}

export interface HomeLatestTimelineEntry {
  entryId: string;
  sortIndex?: string;
  content: HomeLatestTimelineEntryContent;
}

export type HomeLatestTimelineEntryContent =
  | HomeLatestTimelineItemContent
  | HomeLatestTimelineCursorContent
  | HomeLatestTimelineUnknownEntryContent;

export interface HomeLatestTimelineItemContent {
  __typename?: 'TimelineTimelineItem' | string;
  entryType?: 'TimelineTimelineItem' | string;
  itemContent?: HomeLatestTimelineTweetItem;
  clientEventInfo?: HomeLatestTimelineClientEventInfo;
}

export interface HomeLatestTimelineCursorContent {
  __typename?: 'TimelineTimelineCursor' | string;
  entryType?: 'TimelineTimelineCursor' | string;
  cursorType?: 'Top' | 'Bottom' | string;
  value?: string;
}

export interface HomeLatestTimelineUnknownEntryContent {
  __typename?: string;
  [key: string]: unknown;
}

export interface HomeLatestTimelineClientEventInfo {
  component?: string;
  element?: string;
  details?: {
    timelinesDetails?: {
      injectionType?: string;
      controllerData?: string;
    };
  };
}

export interface HomeLatestTimelineTweetItem {
  __typename?: 'TimelineTweet' | string;
  itemType?: 'TimelineTweet' | string;
  tweetDisplayType?: string;
  tweet_results?: {
    result?: HomeLatestTimelineTweetResult;
  };
}

export type HomeLatestTimelineTweetResult =
  | HomeLatestTimelineTweet
  | HomeLatestTimelineTweetTombstone
  | HomeLatestTimelineUnknownTweetResult;

export interface HomeLatestTimelineTweet {
  __typename?: 'Tweet' | string;
  rest_id?: string;
  source?: string;
  core?: {
    user_results?: {
      result?: HomeLatestTimelineUser;
    };
  };
  legacy?: HomeLatestTimelineTweetLegacy;
  views?: {
    count?: string;
    state?: string;
  };
  [key: string]: unknown;
}

export interface HomeLatestTimelineTweetLegacy {
  created_at?: string;
  full_text?: string;
  conversation_id_str?: string;
  user_id_str?: string;
  lang?: string;
  bookmark_count?: number;
  favorite_count?: number;
  quote_count?: number;
  reply_count?: number;
  retweet_count?: number;
  bookmarked?: boolean;
  favorited?: boolean;
  retweeted?: boolean;
  entities?: HomeLatestTimelineEntities;
  extended_entities?: HomeLatestTimelineExtendedEntities;
  [key: string]: unknown;
}

export interface HomeLatestTimelineEntities {
  hashtags?: Array<Record<string, unknown>>;
  symbols?: Array<Record<string, unknown>>;
  urls?: Array<Record<string, unknown>>;
  user_mentions?: Array<Record<string, unknown>>;
  media?: HomeLatestTimelineMediaEntity[];
}

export interface HomeLatestTimelineExtendedEntities {
  media?: HomeLatestTimelineMediaEntity[];
}

export interface HomeLatestTimelineMediaEntity {
  id_str?: string;
  media_key?: string;
  type?: string;
  media_url_https?: string;
  url?: string;
  display_url?: string;
  expanded_url?: string;
  sizes?: Record<string, { w?: number; h?: number; resize?: string }>;
  original_info?: {
    width?: number;
    height?: number;
  };
  [key: string]: unknown;
}

export interface HomeLatestTimelineUser {
  __typename?: 'User' | string;
  rest_id?: string;
  id?: string;
  core?: {
    name?: string;
    screen_name?: string;
    created_at?: string;
  };
  legacy?: HomeLatestTimelineUserLegacy;
  verification?: {
    verified?: boolean;
  };
  relationship_perspectives?: {
    following?: boolean;
    followed_by?: boolean;
    blocking?: boolean;
    blocked_by?: boolean;
    muting?: boolean;
  };
  avatar?: {
    image_url?: string
  };
  location?: {
    location?: string
  };
  [key: string]: unknown;
}

export interface HomeLatestTimelineUserLegacy {
  description?: string;
  followers_count?: number;
  friends_count?: number;
  statuses_count?: number;
  media_count?: number;
  favourites_count?: number;
  listed_count?: number;
  verified?: boolean;
  profile_banner_url?: string;
  profile_image_url_https?: string;
  [key: string]: unknown;
}

/**
 * Lifted top-level author fields for easier consumption.
 */
export type HomeLatestTimelineUserSummary = XUserSummary;

/**
 * Lifted top-level engagement metrics for easier consumption.
 */
export type HomeLatestTimelineTweetStats = XTweetStats;

/**
 * Normalized tweet shape extracted from timeline entries.
 */
export type HomeLatestTimelineTweetSummary = XTweetSummary;

export interface HomeLatestTimelineTweetTombstone {
  __typename?: 'TweetTombstone' | string;
  tombstone?: {
    text?: {
      text?: string;
    };
  };
  [key: string]: unknown;
}

export interface HomeLatestTimelineUnknownTweetResult {
  __typename?: string;
  [key: string]: unknown;
}
