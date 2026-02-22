/**
 * Likes GraphQL operation name captured from live traffic.
 */
export type LikesOperationName = 'Likes';

/**
 * Request variables used by Likes GraphQL query.
 */
export interface LikesVariables {
  /** Target profile user id whose liked tweets are requested. */
  userId: string;
  /** Number of timeline entries requested in a single page. */
  count: number;
  /** Whether promoted entries are included in timeline output. */
  includePromotedContent: boolean;
  /** Whether client-event token branch is requested. */
  withClientEventToken: boolean;
  /** Whether Birdwatch/community-note branch is requested. */
  withBirdwatchNotes: boolean;
  /** Whether voice-tweet metadata branch is requested. */
  withVoice: boolean;
  /** Cursor used for pagination. */
  cursor?: string;
}

/**
 * Known feature switches observed in Likes requests.
 * Additional feature flags may appear over time.
 */
export interface LikesFeatures {
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
 * Field toggles shipped with Likes requests.
 */
export interface LikesFieldToggles {
  withArticlePlainText?: boolean;
  [toggleKey: string]: boolean | undefined;
}

/**
 * Public API input for likes timeline.
 *
 * `userId` is the required business field.
 * Protocol defaults stay in default.ts and can be overridden when needed.
 */
export interface LikesRequest {
  /**
   * Target profile user id for likes timeline.
   * Defaults to self user id parsed from `twid` cookie at SDK initialization.
   */
  userId?: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: LikesOperationName;
  /** GraphQL queryId/docId used in URL path. */
  queryId?: string;
  /** Convenience override for variables.count. */
  count?: number;
  /** Convenience override for variables.includePromotedContent. */
  includePromotedContent?: boolean;
  /** Convenience override for variables.withClientEventToken. */
  withClientEventToken?: boolean;
  /** Convenience override for variables.withBirdwatchNotes. */
  withBirdwatchNotes?: boolean;
  /** Convenience override for variables.withVoice. */
  withVoice?: boolean;
  /** Convenience override for variables.cursor. */
  cursor?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<LikesVariables>;
  /** Partial feature overrides merged with defaults. */
  featuresOverride?: Partial<LikesFeatures>;
  /** Partial field toggle overrides merged with defaults. */
  fieldTogglesOverride?: Partial<LikesFieldToggles>;
}

/**
 * Fully materialized request payload sent to Likes endpoint.
 */
export interface LikesResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: LikesOperationName;
  queryId: string;
  variables: LikesVariables;
  features: LikesFeatures;
  fieldToggles: LikesFieldToggles;
}

/**
 * GraphQL error extension payload.
 */
export interface LikesGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface LikesGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: LikesGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface LikesOriginalResponse {
  data?: LikesData;
  errors?: LikesGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface LikesResponse {
  instructions: LikesInstruction[];
  entries: LikesEntry[];
  tweets: LikesTweetSummary[];
  cursorTop?: string;
  cursorBottom?: string;
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  conversationTweetIds: string[];
  errors?: LikesGraphQLError[];
  __original: LikesOriginalResponse;
}

export interface LikesData {
  user?: LikesUserBranch;
}

export interface LikesUserBranch {
  result?: LikesUserResult;
}

export interface LikesUserResult {
  __typename?: string;
  timeline?: LikesUserTimeline;
  [key: string]: unknown;
}

export interface LikesUserTimeline {
  timeline?: LikesTimeline;
}

export interface LikesTimeline {
  instructions?: LikesInstruction[];
  [key: string]: unknown;
}

export type LikesInstruction =
  | LikesAddEntriesInstruction
  | LikesClearCacheInstruction
  | LikesTerminateTimelineInstruction
  | LikesUnknownInstruction;

export interface LikesAddEntriesInstruction {
  type: 'TimelineAddEntries';
  entries: LikesEntry[];
}

export interface LikesClearCacheInstruction {
  type: 'TimelineClearCache';
}

export interface LikesTerminateTimelineInstruction {
  type: 'TimelineTerminateTimeline';
  direction?: 'Top' | 'Bottom' | string;
}

export interface LikesUnknownInstruction {
  type?: string;
  direction?: string;
  entries?: LikesEntry[];
  [key: string]: unknown;
}

export interface LikesEntry {
  entryId: string;
  sortIndex?: string;
  content: LikesEntryContent;
}

export type LikesEntryContent =
  | LikesItemEntryContent
  | LikesCursorEntryContent
  | LikesModuleEntryContent
  | LikesUnknownEntryContent;

export interface LikesItemEntryContent {
  __typename?: 'TimelineTimelineItem' | string;
  entryType?: 'TimelineTimelineItem' | string;
  itemContent?: LikesTimelineItemContent;
  clientEventInfo?: LikesClientEventInfo;
}

export interface LikesCursorEntryContent {
  __typename?: 'TimelineTimelineCursor' | string;
  entryType?: 'TimelineTimelineCursor' | string;
  cursorType?: string;
  value?: string;
}

export interface LikesModuleEntryContent {
  __typename?: 'TimelineTimelineModule' | string;
  entryType?: 'TimelineTimelineModule' | string;
  items?: LikesModuleItem[];
  metadata?: LikesModuleMetadata;
  clientEventInfo?: LikesClientEventInfo;
}

export interface LikesUnknownEntryContent {
  __typename?: string;
  [key: string]: unknown;
}

export interface LikesClientEventInfo {
  component?: string;
  element?: string;
  details?: {
    timelinesDetails?: {
      injectionType?: string;
      controllerData?: string;
    };
  };
}

export interface LikesModuleMetadata {
  conversationMetadata?: {
    allTweetIds?: string[];
  };
  [key: string]: unknown;
}

export interface LikesModuleItem {
  entryId: string;
  item?: {
    itemContent?: LikesTimelineItemContent;
  };
}

export interface LikesTimelineItemContent {
  __typename?: string;
  itemType?: string;
  tweetDisplayType?: string;
  tweet_results?: {
    result?: LikesTweetResult;
  };
}

export type LikesTweetResult =
  | LikesTweet
  | LikesTweetWithVisibilityResults
  | LikesTweetTombstone
  | LikesUnknownTweetResult;

export interface LikesTweetWithVisibilityResults {
  __typename?: 'TweetWithVisibilityResults' | string;
  tweet?: LikesTweet;
}

export interface LikesTweetTombstone {
  __typename?: 'TweetTombstone' | string;
  tombstone?: {
    text?: {
      text?: string;
    };
  };
}

export interface LikesUnknownTweetResult {
  __typename?: string;
  [key: string]: unknown;
}

export interface LikesTweet {
  __typename?: 'Tweet' | string;
  rest_id?: string;
  source?: string;
  core?: {
    user_results?: {
      result?: LikesUser;
    };
  };
  legacy?: LikesTweetLegacy;
  views?: {
    count?: string;
    state?: string;
  };
  [key: string]: unknown;
}

export interface LikesTweetLegacy {
  conversation_id_str?: string;
  created_at?: string;
  full_text?: string;
  lang?: string;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id_str?: string;
  reply_count?: number;
  retweet_count?: number;
  favorite_count?: number;
  quote_count?: number;
  bookmark_count?: number;
  bookmarked?: boolean;
  favorited?: boolean;
  retweeted?: boolean;
  user_id_str?: string;
  [key: string]: unknown;
}

export interface LikesUser {
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
  legacy?: LikesUserLegacy;
  verification?: {
    verified?: boolean;
  };
  [key: string]: unknown;
}

export interface LikesUserLegacy {
  name?: string;
  screen_name?: string;
  verified?: boolean;
  profile_image_url_https?: string;
  [key: string]: unknown;
}

export interface LikesTweetSummary {
  entryId: string;
  sortIndex?: string;
  tweetId?: string;
  fullText?: string;
  createdAt?: string;
  language?: string;
  source?: string;
  conversationId?: string;
  inReplyToTweetId?: string;
  inReplyToUserId?: string;
  viewCount?: string;
  user?: LikesUserSummary;
  stats?: LikesTweetStats;
  viewerState?: LikesViewerState;
}

export interface LikesUserSummary {
  userId?: string;
  name?: string;
  screenName?: string;
  verified?: boolean;
  profileImageUrl?: string;
}

export interface LikesTweetStats {
  replyCount?: number;
  retweetCount?: number;
  likeCount?: number;
  quoteCount?: number;
  bookmarkCount?: number;
}

export interface LikesViewerState {
  bookmarked?: boolean;
  favorited?: boolean;
  retweeted?: boolean;
}
