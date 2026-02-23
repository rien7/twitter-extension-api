/**
 * NotificationsTimeline GraphQL operation name captured from live traffic.
 */
export type NotificationsTimelineOperationName = 'NotificationsTimeline';

/**
 * Request variables used by NotificationsTimeline GraphQL query.
 */
export interface NotificationsTimelineVariables {
  /** Notification timeline bucket. Captured value is `All`. */
  timeline_type: string;
  /** Number of timeline entries requested in a single page. */
  count: number;
  /** Cursor used for pagination. */
  cursor?: string;
}

/**
 * Known feature switches observed in NotificationsTimeline requests.
 * Additional feature flags may appear over time.
 */
export interface NotificationsTimelineFeatures {
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
 * Public API input for notifications timeline.
 */
export interface NotificationsTimelineRequest {
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: NotificationsTimelineOperationName;
  /** GraphQL queryId/docId used in URL path. */
  queryId?: string;
  /** Convenience override for variables.timeline_type. */
  timelineType?: string;
  /** Convenience override for variables.count. */
  count?: number;
  /** Convenience override for variables.cursor. */
  cursor?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<NotificationsTimelineVariables>;
  /** Partial feature overrides merged with defaults. */
  featuresOverride?: Partial<NotificationsTimelineFeatures>;
}

/**
 * Fully materialized request payload sent to NotificationsTimeline endpoint.
 */
export interface NotificationsTimelineResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: NotificationsTimelineOperationName;
  queryId: string;
  variables: NotificationsTimelineVariables;
  features: NotificationsTimelineFeatures;
}

/**
 * GraphQL error extension payload.
 */
export interface NotificationsTimelineGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface NotificationsTimelineGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: NotificationsTimelineGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface NotificationsTimelineOriginalResponse {
  data?: NotificationsTimelineData;
  errors?: NotificationsTimelineGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface NotificationsTimelineResponse {
  timelineId?: string;
  viewerUserId?: string;
  instructions: NotificationsTimelineInstruction[];
  entries: NotificationsTimelineEntry[];
  notifications: NotificationsTimelineNotificationSummary[];
  tweets: NotificationsTimelineTweetSummary[];
  cursorTop?: string;
  cursorBottom?: string;
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  unreadMarkerSortIndex?: string;
  clearedUnreadState: boolean;
  errors?: NotificationsTimelineGraphQLError[];
  __original: NotificationsTimelineOriginalResponse;
}

export interface NotificationsTimelineData {
  viewer_v2?: NotificationsTimelineViewerV2;
}

export interface NotificationsTimelineViewerV2 {
  user_results?: {
    result?: NotificationsTimelineViewerResult;
  };
}

export interface NotificationsTimelineViewerResult {
  __typename?: string;
  rest_id?: string;
  notification_timeline?: NotificationsTimelineBranch;
  [key: string]: unknown;
}

export interface NotificationsTimelineBranch {
  id?: string;
  timeline?: NotificationsTimelineTimeline;
  [key: string]: unknown;
}

export interface NotificationsTimelineTimeline {
  instructions?: NotificationsTimelineInstruction[];
  [key: string]: unknown;
}

export type NotificationsTimelineInstruction =
  | NotificationsTimelineAddEntriesInstruction
  | NotificationsTimelineClearCacheInstruction
  | NotificationsTimelineClearEntriesUnreadStateInstruction
  | NotificationsTimelineMarkEntriesUnreadGreaterThanSortIndexInstruction
  | NotificationsTimelineUnknownInstruction;

export interface NotificationsTimelineAddEntriesInstruction {
  type: 'TimelineAddEntries';
  entries: NotificationsTimelineEntry[];
}

export interface NotificationsTimelineClearCacheInstruction {
  type: 'TimelineClearCache';
}

export interface NotificationsTimelineClearEntriesUnreadStateInstruction {
  type: 'TimelineClearEntriesUnreadState';
}

export interface NotificationsTimelineMarkEntriesUnreadGreaterThanSortIndexInstruction {
  type: 'TimelineMarkEntriesUnreadGreaterThanSortIndex';
  sort_index?: string;
}

export interface NotificationsTimelineUnknownInstruction {
  type?: string;
  sort_index?: string;
  entries?: NotificationsTimelineEntry[];
  [key: string]: unknown;
}

export interface NotificationsTimelineEntry {
  entryId: string;
  sortIndex?: string;
  content: NotificationsTimelineEntryContent;
}

export type NotificationsTimelineEntryContent =
  | NotificationsTimelineItemEntryContent
  | NotificationsTimelineCursorEntryContent
  | NotificationsTimelineUnknownEntryContent;

export interface NotificationsTimelineItemEntryContent {
  __typename?: 'TimelineTimelineItem' | string;
  entryType?: 'TimelineTimelineItem' | string;
  itemContent?: NotificationsTimelineItemContent;
  clientEventInfo?: NotificationsTimelineClientEventInfo;
}

export interface NotificationsTimelineCursorEntryContent {
  __typename?: 'TimelineTimelineCursor' | string;
  entryType?: 'TimelineTimelineCursor' | string;
  cursorType?: string;
  value?: string;
}

export interface NotificationsTimelineUnknownEntryContent {
  __typename?: string;
  [key: string]: unknown;
}

export interface NotificationsTimelineClientEventInfo {
  component?: string;
  element?: string;
  details?: {
    notificationDetails?: {
      impressionId?: string;
      metadata?: string;
    };
    timelinesDetails?: {
      injectionType?: string;
      controllerData?: string;
    };
  };
}

export type NotificationsTimelineItemContent =
  | NotificationsTimelineNotificationItemContent
  | NotificationsTimelineTweetItemContent
  | NotificationsTimelineUnknownItemContent;

export interface NotificationsTimelineNotificationItemContent {
  __typename?: 'TimelineNotification' | string;
  itemType?: 'TimelineNotification' | string;
  id?: string;
  notification_icon?: string;
  notification_url?: NotificationsTimelineNotificationUrl;
  rich_message?: NotificationsTimelineRichMessage;
  template?: NotificationsTimelineNotificationTemplate;
  timestamp_ms?: string;
  [key: string]: unknown;
}

export interface NotificationsTimelineTweetItemContent {
  __typename?: 'TimelineTweet' | string;
  itemType?: 'TimelineTweet' | string;
  tweetDisplayType?: string;
  tweet_results?: {
    result?: NotificationsTimelineTweetResult;
  };
  [key: string]: unknown;
}

export interface NotificationsTimelineUnknownItemContent {
  __typename?: string;
  itemType?: string;
  [key: string]: unknown;
}

export interface NotificationsTimelineNotificationUrl {
  url?: string;
  urlType?: string;
  urtEndpointOptions?: {
    cacheId?: string;
    subtitle?: string;
    title?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface NotificationsTimelineRichMessage {
  text?: string;
  rtl?: boolean;
  entities?: NotificationsTimelineRichMessageEntity[];
  [key: string]: unknown;
}

export interface NotificationsTimelineRichMessageEntity {
  fromIndex?: number;
  toIndex?: number;
  ref?: NotificationsTimelineRichMessageRef;
  [key: string]: unknown;
}

export interface NotificationsTimelineRichMessageRef {
  type?: string;
  user_results?: {
    result?: NotificationsTimelineUserResult;
  };
  tweet_results?: {
    result?: NotificationsTimelineTweetResult;
  };
  [key: string]: unknown;
}

export interface NotificationsTimelineNotificationTemplate {
  __typename?: string;
  from_users?: NotificationsTimelineNotificationUserRef[];
  target_objects?: NotificationsTimelineNotificationTargetObject[];
  [key: string]: unknown;
}

export interface NotificationsTimelineNotificationUserRef {
  __typename?: string;
  user_results?: {
    result?: NotificationsTimelineUserResult;
  };
  [key: string]: unknown;
}

export interface NotificationsTimelineNotificationTargetObject {
  __typename?: string;
  tweet_results?: {
    result?: NotificationsTimelineTweetResult;
  };
  [key: string]: unknown;
}

export type NotificationsTimelineUserResult =
  | NotificationsTimelineUser
  | NotificationsTimelineUserUnavailable
  | NotificationsTimelineUnknownUserResult;

export interface NotificationsTimelineUser {
  __typename?: 'User' | string;
  id?: string;
  rest_id?: string;
  core?: {
    name?: string;
    screen_name?: string;
    created_at?: string;
  };
  avatar?: {
    image_url?: string;
  };
  legacy?: {
    name?: string;
    screen_name?: string;
    verified?: boolean;
    profile_image_url_https?: string;
    [key: string]: unknown;
  };
  verification?: {
    verified?: boolean;
  };
  [key: string]: unknown;
}

export interface NotificationsTimelineUserUnavailable {
  __typename?: 'UserUnavailable' | string;
  reason?: string;
  [key: string]: unknown;
}

export interface NotificationsTimelineUnknownUserResult {
  __typename?: string;
  [key: string]: unknown;
}

export type NotificationsTimelineTweetResult =
  | NotificationsTimelineTweet
  | NotificationsTimelineTweetWithVisibilityResults
  | NotificationsTimelineTweetTombstone
  | NotificationsTimelineUnknownTweetResult;

export interface NotificationsTimelineTweet {
  __typename?: 'Tweet' | string;
  rest_id?: string;
  source?: string;
  core?: {
    user_results?: {
      result?: NotificationsTimelineUserResult;
    };
  };
  legacy?: NotificationsTimelineTweetLegacy;
  views?: {
    count?: string;
    state?: string;
  };
  [key: string]: unknown;
}

export interface NotificationsTimelineTweetWithVisibilityResults {
  __typename?: 'TweetWithVisibilityResults' | string;
  tweet?: NotificationsTimelineTweet;
  [key: string]: unknown;
}

export interface NotificationsTimelineTweetTombstone {
  __typename?: 'TweetTombstone' | string;
  tombstone?: {
    text?: {
      text?: string;
      entities?: Array<Record<string, unknown>>;
    };
  };
  [key: string]: unknown;
}

export interface NotificationsTimelineUnknownTweetResult {
  __typename?: string;
  [key: string]: unknown;
}

export interface NotificationsTimelineTweetLegacy {
  created_at?: string;
  full_text?: string;
  lang?: string;
  conversation_id_str?: string;
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
  [key: string]: unknown;
}

export interface NotificationsTimelineUserSummary {
  userId?: string;
  name?: string;
  screenName?: string;
  verified?: boolean;
  profileImageUrl?: string;
}

export interface NotificationsTimelineNotificationSummary {
  entryId: string;
  sortIndex?: string;
  notificationId?: string;
  icon?: string;
  timestampMs?: string;
  messageText?: string;
  url?: string;
  urlType?: string;
  templateType?: string;
  fromUsers: NotificationsTimelineUserSummary[];
  targetTweetIds: string[];
}

export interface NotificationsTimelineTweetSummary {
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
  user?: NotificationsTimelineUserSummary;
  stats: {
    replyCount?: number;
    retweetCount?: number;
    likeCount?: number;
    quoteCount?: number;
    bookmarkCount?: number;
  };
  viewerState: {
    bookmarked?: boolean;
    favorited?: boolean;
    retweeted?: boolean;
  };
}
