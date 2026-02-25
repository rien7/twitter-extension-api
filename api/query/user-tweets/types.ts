import type {
  XTweetStats,
  XTweetSummary,
  XTweetTimelineResponseBase,
  XTweetViewerState,
  XUserSummary
} from '../../../src/shared/types';

/**
 * UserTweets GraphQL operation name captured from live traffic.
 */
export type UserTweetsOperationName = 'UserTweets';

/**
 * Request variables used by UserTweets GraphQL query.
 */
export interface UserTweetsVariables {
  /** Target profile user id whose tweets are requested. */
  userId: string;
  /** Number of timeline entries requested in a single page. */
  count: number;
  /** Whether promoted entries are included in timeline output. */
  includePromotedContent: boolean;
  /** Whether quick-promote eligibility fields are requested in tweet branches. */
  withQuickPromoteEligibilityTweetFields: boolean;
  /** Whether voice-tweet metadata branch is requested. */
  withVoice: boolean;
  /** Cursor used for pagination. */
  cursor?: string;
}

/**
 * Known feature switches observed in UserTweets requests.
 * Additional feature flags may appear over time.
 */
export interface UserTweetsFeatures {
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
 * Field toggles shipped with UserTweets requests.
 */
export interface UserTweetsFieldToggles {
  withArticlePlainText?: boolean;
  [toggleKey: string]: boolean | undefined;
}

/**
 * Public API input for user tweets timeline.
 *
 * `userId` is the required business field.
 */
export interface UserTweetsRequest {
  /**
   * Target profile user id for tweets timeline.
   * Defaults to self user id parsed from `twid` cookie at SDK initialization.
   */
  userId?: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: UserTweetsOperationName;
  /** GraphQL queryId/docId used in URL path. */
  queryId?: string;
  /** Convenience override for variables.count. */
  count?: number;
  /** Convenience override for variables.includePromotedContent. */
  includePromotedContent?: boolean;
  /** Convenience override for variables.withQuickPromoteEligibilityTweetFields. */
  withQuickPromoteEligibilityTweetFields?: boolean;
  /** Convenience override for variables.withVoice. */
  withVoice?: boolean;
  /** Convenience override for variables.cursor. */
  cursor?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<UserTweetsVariables>;
  /** Partial feature overrides merged with defaults. */
  featuresOverride?: Partial<UserTweetsFeatures>;
  /** Partial field toggle overrides merged with defaults. */
  fieldTogglesOverride?: Partial<UserTweetsFieldToggles>;
}

/**
 * Fully materialized request payload sent to UserTweets endpoint.
 */
export interface UserTweetsResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: UserTweetsOperationName;
  queryId: string;
  variables: UserTweetsVariables;
  features: UserTweetsFeatures;
  fieldToggles: UserTweetsFieldToggles;
}

/**
 * GraphQL error extension payload.
 */
export interface UserTweetsGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface UserTweetsGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: UserTweetsGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface UserTweetsOriginalResponse {
  data?: UserTweetsData;
  errors?: UserTweetsGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface UserTweetsResponse
  extends XTweetTimelineResponseBase<
    UserTweetsInstruction,
    UserTweetsEntry,
    UserTweetsOriginalResponse,
    UserTweetsGraphQLError
  > {
  conversationTweetIds: string[];
}

export interface UserTweetsData {
  user?: UserTweetsUserBranch;
}

export interface UserTweetsUserBranch {
  result?: UserTweetsUserResult;
}

export interface UserTweetsUserResult {
  __typename?: string;
  timeline?: UserTweetsUserTimeline;
  [key: string]: unknown;
}

export interface UserTweetsUserTimeline {
  timeline?: UserTweetsTimeline;
}

export interface UserTweetsTimeline {
  instructions?: UserTweetsInstruction[];
  [key: string]: unknown;
}

export type UserTweetsInstruction =
  | UserTweetsAddEntriesInstruction
  | UserTweetsClearCacheInstruction
  | UserTweetsTerminateTimelineInstruction
  | UserTweetsUnknownInstruction;

export interface UserTweetsAddEntriesInstruction {
  type: 'TimelineAddEntries';
  entries: UserTweetsEntry[];
}

export interface UserTweetsClearCacheInstruction {
  type: 'TimelineClearCache';
}

export interface UserTweetsTerminateTimelineInstruction {
  type: 'TimelineTerminateTimeline';
  direction?: 'Top' | 'Bottom' | string;
}

export interface UserTweetsUnknownInstruction {
  type?: string;
  direction?: string;
  entries?: UserTweetsEntry[];
  [key: string]: unknown;
}

export interface UserTweetsEntry {
  entryId: string;
  sortIndex?: string;
  content: UserTweetsEntryContent;
}

export type UserTweetsEntryContent =
  | UserTweetsItemEntryContent
  | UserTweetsCursorEntryContent
  | UserTweetsModuleEntryContent
  | UserTweetsUnknownEntryContent;

export interface UserTweetsItemEntryContent {
  __typename?: 'TimelineTimelineItem' | string;
  entryType?: 'TimelineTimelineItem' | string;
  itemContent?: UserTweetsTimelineItemContent;
  clientEventInfo?: UserTweetsClientEventInfo;
}

export interface UserTweetsCursorEntryContent {
  __typename?: 'TimelineTimelineCursor' | string;
  entryType?: 'TimelineTimelineCursor' | string;
  cursorType?: string;
  value?: string;
}

export interface UserTweetsModuleEntryContent {
  __typename?: 'TimelineTimelineModule' | string;
  entryType?: 'TimelineTimelineModule' | string;
  items?: UserTweetsModuleItem[];
  metadata?: UserTweetsModuleMetadata;
  clientEventInfo?: UserTweetsClientEventInfo;
}

export interface UserTweetsUnknownEntryContent {
  __typename?: string;
  [key: string]: unknown;
}

export interface UserTweetsClientEventInfo {
  component?: string;
  element?: string;
  details?: {
    timelinesDetails?: {
      injectionType?: string;
      controllerData?: string;
    };
  };
}

export interface UserTweetsModuleMetadata {
  conversationMetadata?: {
    allTweetIds?: string[];
  };
  [key: string]: unknown;
}

export interface UserTweetsModuleItem {
  entryId: string;
  item?: {
    itemContent?: UserTweetsTimelineItemContent;
  };
}

export interface UserTweetsTimelineItemContent {
  __typename?: string;
  itemType?: string;
  tweetDisplayType?: string;
  tweet_results?: {
    result?: UserTweetsTweetResult;
  };
}

export type UserTweetsTweetResult =
  | UserTweetsTweet
  | UserTweetsTweetWithVisibilityResults
  | UserTweetsTweetTombstone
  | UserTweetsUnknownTweetResult;

export interface UserTweetsTweetWithVisibilityResults {
  __typename?: 'TweetWithVisibilityResults' | string;
  tweet?: UserTweetsTweet;
}

export interface UserTweetsTweetTombstone {
  __typename?: 'TweetTombstone' | string;
  tombstone?: {
    text?: {
      text?: string;
    };
  };
}

export interface UserTweetsUnknownTweetResult {
  __typename?: string;
  [key: string]: unknown;
}

export interface UserTweetsTweet {
  __typename?: 'Tweet' | string;
  rest_id?: string;
  source?: string;
  core?: {
    user_results?: {
      result?: UserTweetsUser;
    };
  };
  legacy?: UserTweetsTweetLegacy;
  views?: {
    count?: string;
    state?: string;
  };
  [key: string]: unknown;
}

export interface UserTweetsTweetLegacy {
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

export interface UserTweetsUser {
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
  legacy?: UserTweetsUserLegacy;
  verification?: {
    verified?: boolean;
  };
  [key: string]: unknown;
}

export interface UserTweetsUserLegacy {
  name?: string;
  screen_name?: string;
  verified?: boolean;
  profile_image_url_https?: string;
  [key: string]: unknown;
}

export type UserTweetsTweetSummary = XTweetSummary;

export type UserTweetsUserSummary = XUserSummary;

export type UserTweetsTweetStats = XTweetStats;

export type UserTweetsViewerState = XTweetViewerState;
