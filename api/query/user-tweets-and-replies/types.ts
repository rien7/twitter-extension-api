import type {
  XTweetStats,
  XTweetSummary,
  XTweetViewerState,
  XUserSummary
} from '../../../src/shared/types';

/**
 * UserTweetsAndReplies GraphQL operation name captured from live traffic.
 */
export type UserTweetsAndRepliesOperationName = 'UserTweetsAndReplies';

/**
 * Request variables used by UserTweetsAndReplies GraphQL query.
 */
export interface UserTweetsAndRepliesVariables {
  /** Target profile user id whose tweets and replies are requested. */
  userId: string;
  /** Number of timeline entries requested in a single page. */
  count: number;
  /** Whether promoted entries are included in timeline output. */
  includePromotedContent: boolean;
  /** Whether community branches are included in timeline output. */
  withCommunity: boolean;
  /** Whether voice-tweet metadata branch is requested. */
  withVoice: boolean;
  /** Cursor used for pagination. */
  cursor?: string;
}

/**
 * Known feature switches observed in UserTweetsAndReplies requests.
 * Additional feature flags may appear over time.
 */
export interface UserTweetsAndRepliesFeatures {
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
 * Field toggles shipped with UserTweetsAndReplies requests.
 */
export interface UserTweetsAndRepliesFieldToggles {
  withArticlePlainText?: boolean;
  [toggleKey: string]: boolean | undefined;
}

/**
 * Public API input for user tweets and replies timeline.
 *
 * `userId` is the required business field.
 */
export interface UserTweetsAndRepliesRequest {
  /**
   * Target profile user id for tweets and replies timeline.
   * Defaults to self user id parsed from `twid` cookie at SDK initialization.
   */
  userId?: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: UserTweetsAndRepliesOperationName;
  /** GraphQL queryId/docId used in URL path. */
  queryId?: string;
  /** Convenience override for variables.count. */
  count?: number;
  /** Convenience override for variables.includePromotedContent. */
  includePromotedContent?: boolean;
  /** Convenience override for variables.withCommunity. */
  withCommunity?: boolean;
  /** Convenience override for variables.withVoice. */
  withVoice?: boolean;
  /** Convenience override for variables.cursor. */
  cursor?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<UserTweetsAndRepliesVariables>;
  /** Partial feature overrides merged with defaults. */
  featuresOverride?: Partial<UserTweetsAndRepliesFeatures>;
  /** Partial field toggle overrides merged with defaults. */
  fieldTogglesOverride?: Partial<UserTweetsAndRepliesFieldToggles>;
}

/**
 * Fully materialized request payload sent to UserTweetsAndReplies endpoint.
 */
export interface UserTweetsAndRepliesResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: UserTweetsAndRepliesOperationName;
  queryId: string;
  variables: UserTweetsAndRepliesVariables;
  features: UserTweetsAndRepliesFeatures;
  fieldToggles: UserTweetsAndRepliesFieldToggles;
}

/**
 * GraphQL error extension payload.
 */
export interface UserTweetsAndRepliesGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface UserTweetsAndRepliesGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: UserTweetsAndRepliesGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface UserTweetsAndRepliesOriginalResponse {
  data?: UserTweetsAndRepliesData;
  errors?: UserTweetsAndRepliesGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface UserTweetsAndRepliesResponse {
  instructions: UserTweetsAndRepliesInstruction[];
  entries: UserTweetsAndRepliesEntry[];
  tweets: UserTweetsAndRepliesTweetSummary[];
  cursorTop?: string;
  cursorBottom?: string;
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  conversationTweetIds: string[];
  errors?: UserTweetsAndRepliesGraphQLError[];
  __original: UserTweetsAndRepliesOriginalResponse;
}

export interface UserTweetsAndRepliesData {
  user?: UserTweetsAndRepliesUserBranch;
}

export interface UserTweetsAndRepliesUserBranch {
  result?: UserTweetsAndRepliesUserResult;
}

export interface UserTweetsAndRepliesUserResult {
  __typename?: string;
  timeline?: UserTweetsAndRepliesUserTimeline;
  [key: string]: unknown;
}

export interface UserTweetsAndRepliesUserTimeline {
  timeline?: UserTweetsAndRepliesTimeline;
}

export interface UserTweetsAndRepliesTimeline {
  instructions?: UserTweetsAndRepliesInstruction[];
  [key: string]: unknown;
}

export type UserTweetsAndRepliesInstruction =
  | UserTweetsAndRepliesAddEntriesInstruction
  | UserTweetsAndRepliesClearCacheInstruction
  | UserTweetsAndRepliesTerminateTimelineInstruction
  | UserTweetsAndRepliesUnknownInstruction;

export interface UserTweetsAndRepliesAddEntriesInstruction {
  type: 'TimelineAddEntries';
  entries: UserTweetsAndRepliesEntry[];
}

export interface UserTweetsAndRepliesClearCacheInstruction {
  type: 'TimelineClearCache';
}

export interface UserTweetsAndRepliesTerminateTimelineInstruction {
  type: 'TimelineTerminateTimeline';
  direction?: 'Top' | 'Bottom' | string;
}

export interface UserTweetsAndRepliesUnknownInstruction {
  type?: string;
  direction?: string;
  entries?: UserTweetsAndRepliesEntry[];
  [key: string]: unknown;
}

export interface UserTweetsAndRepliesEntry {
  entryId: string;
  sortIndex?: string;
  content: UserTweetsAndRepliesEntryContent;
}

export type UserTweetsAndRepliesEntryContent =
  | UserTweetsAndRepliesItemEntryContent
  | UserTweetsAndRepliesCursorEntryContent
  | UserTweetsAndRepliesModuleEntryContent
  | UserTweetsAndRepliesUnknownEntryContent;

export interface UserTweetsAndRepliesItemEntryContent {
  __typename?: 'TimelineTimelineItem' | string;
  entryType?: 'TimelineTimelineItem' | string;
  itemContent?: UserTweetsAndRepliesTimelineItemContent;
  clientEventInfo?: UserTweetsAndRepliesClientEventInfo;
}

export interface UserTweetsAndRepliesCursorEntryContent {
  __typename?: 'TimelineTimelineCursor' | string;
  entryType?: 'TimelineTimelineCursor' | string;
  cursorType?: string;
  value?: string;
}

export interface UserTweetsAndRepliesModuleEntryContent {
  __typename?: 'TimelineTimelineModule' | string;
  entryType?: 'TimelineTimelineModule' | string;
  items?: UserTweetsAndRepliesModuleItem[];
  metadata?: UserTweetsAndRepliesModuleMetadata;
  clientEventInfo?: UserTweetsAndRepliesClientEventInfo;
}

export interface UserTweetsAndRepliesUnknownEntryContent {
  __typename?: string;
  [key: string]: unknown;
}

export interface UserTweetsAndRepliesClientEventInfo {
  component?: string;
  element?: string;
  details?: {
    timelinesDetails?: {
      injectionType?: string;
      controllerData?: string;
    };
  };
}

export interface UserTweetsAndRepliesModuleMetadata {
  conversationMetadata?: {
    allTweetIds?: string[];
  };
  [key: string]: unknown;
}

export interface UserTweetsAndRepliesModuleItem {
  entryId: string;
  item?: {
    itemContent?: UserTweetsAndRepliesTimelineItemContent;
  };
}

export interface UserTweetsAndRepliesTimelineItemContent {
  __typename?: string;
  itemType?: string;
  tweetDisplayType?: string;
  tweet_results?: {
    result?: UserTweetsAndRepliesTweetResult;
  };
}

export type UserTweetsAndRepliesTweetResult =
  | UserTweetsAndRepliesTweet
  | UserTweetsAndRepliesTweetWithVisibilityResults
  | UserTweetsAndRepliesTweetTombstone
  | UserTweetsAndRepliesUnknownTweetResult;

export interface UserTweetsAndRepliesTweetWithVisibilityResults {
  __typename?: 'TweetWithVisibilityResults' | string;
  tweet?: UserTweetsAndRepliesTweet;
}

export interface UserTweetsAndRepliesTweetTombstone {
  __typename?: 'TweetTombstone' | string;
  tombstone?: {
    text?: {
      text?: string;
    };
  };
}

export interface UserTweetsAndRepliesUnknownTweetResult {
  __typename?: string;
  [key: string]: unknown;
}

export interface UserTweetsAndRepliesTweet {
  __typename?: 'Tweet' | string;
  rest_id?: string;
  source?: string;
  core?: {
    user_results?: {
      result?: UserTweetsAndRepliesUser;
    };
  };
  legacy?: UserTweetsAndRepliesTweetLegacy;
  views?: {
    count?: string;
    state?: string;
  };
  [key: string]: unknown;
}

export interface UserTweetsAndRepliesTweetLegacy {
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

export interface UserTweetsAndRepliesUser {
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
  legacy?: UserTweetsAndRepliesUserLegacy;
  verification?: {
    verified?: boolean;
  };
  [key: string]: unknown;
}

export interface UserTweetsAndRepliesUserLegacy {
  name?: string;
  screen_name?: string;
  verified?: boolean;
  profile_image_url_https?: string;
  [key: string]: unknown;
}

export type UserTweetsAndRepliesTweetSummary = XTweetSummary;

export type UserTweetsAndRepliesUserSummary = XUserSummary;

export type UserTweetsAndRepliesTweetStats = XTweetStats;

export type UserTweetsAndRepliesViewerState = XTweetViewerState;
