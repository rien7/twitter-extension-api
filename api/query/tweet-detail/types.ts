/**
 * TweetDetail GraphQL operation name captured from live traffic.
 */
export type TweetDetailOperationName = 'TweetDetail';

/**
 * Request variables used by TweetDetail GraphQL query.
 */
export interface TweetDetailVariables {
  /** Include promoted replies/recommendations in detail timeline. */
  includePromotedContent: boolean;
  /** Ranking strategy for replies/conversation blocks. */
  rankingMode: string;
  /** Request source context seen in traffic, usually `Home`. */
  referrer: string;
  /** Include Community Notes (Birdwatch) branch. */
  withBirdwatchNotes: boolean;
  /** Include community metadata in tweet branches. */
  withCommunity: boolean;
  /** Include quick-promote eligibility for each tweet. */
  withQuickPromoteEligibilityTweetFields: boolean;
  /** Include voice metadata branch for voice tweets. */
  withVoice: boolean;
  /** Include RUX injections branch. */
  with_rux_injections: boolean;
  /** Target tweet id used to fetch conversation/detail thread. */
  focalTweetId: string;
}

/**
 * Known feature switches observed in TweetDetail requests.
 * New feature flags may be added by X at any time.
 */
export interface TweetDetailFeatures {
  articles_preview_enabled?: boolean;
  c9s_tweet_anatomy_moderator_badge_enabled?: boolean;
  communities_web_enable_tweet_community_results_fetch?: boolean;
  creator_subscriptions_quote_tweet_preview_enabled?: boolean;
  creator_subscriptions_tweet_preview_api_enabled?: boolean;
  freedom_of_speech_not_reach_fetch_enabled?: boolean;
  graphql_is_translatable_rweb_tweet_is_translatable_enabled?: boolean;
  interactive_text_enabled?: boolean;
  longform_notetweets_consumption_enabled?: boolean;
  longform_notetweets_inline_media_enabled?: boolean;
  longform_notetweets_rich_text_read_enabled?: boolean;
  payments_enabled?: boolean;
  premium_content_api_read_enabled?: boolean;
  profile_label_improvements_pcf_label_in_post_enabled?: boolean;
  responsive_web_edit_tweet_api_enabled?: boolean;
  responsive_web_enhance_cards_enabled?: boolean;
  responsive_web_graphql_exclude_directive_enabled?: boolean;
  responsive_web_graphql_skip_user_profile_image_extensions_enabled?: boolean;
  responsive_web_graphql_timeline_navigation_enabled?: boolean;
  responsive_web_grok_analysis_button_from_backend?: boolean;
  responsive_web_grok_analyze_button_fetch_trends_enabled?: boolean;
  responsive_web_grok_analyze_post_followups_enabled?: boolean;
  responsive_web_grok_community_note_auto_translation_is_enabled?: boolean;
  responsive_web_grok_image_annotation_enabled?: boolean;
  responsive_web_grok_imagine_annotation_enabled?: boolean;
  responsive_web_grok_share_attachment_enabled?: boolean;
  responsive_web_grok_show_grok_translated_post?: boolean;
  responsive_web_jetfuel_frame?: boolean;
  responsive_web_text_conversations_enabled?: boolean;
  responsive_web_twitter_article_tweet_consumption_enabled?: boolean;
  rweb_tipjar_consumption_enabled?: boolean;
  rweb_video_screen_enabled?: boolean;
  standardized_nudges_misinfo?: boolean;
  tweet_awards_web_tipping_enabled?: boolean;
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled?: boolean;
  verified_phone_label_enabled?: boolean;
  vibe_api_enabled?: boolean;
  view_counts_everywhere_api_enabled?: boolean;
  [featureKey: string]: boolean | undefined;
}

/**
 * Field toggles shipped with TweetDetail requests.
 */
export interface TweetDetailFieldToggles {
  withArticlePlainText?: boolean;
  withArticleRichContentState?: boolean;
  withAuxiliaryUserLabels?: boolean;
  withCategoryGoodId?: boolean;
  withDisallowedReplyControls?: boolean;
  withGrokAnalyze?: boolean;
  withSawaraEnabled?: boolean;
  [toggleKey: string]: boolean | undefined;
}

/**
 * Public API input for tweet-detail.
 *
 * `detailId` is the only required business field.
 * Protocol-level parameters remain in default.ts and can be overridden here.
 */
export interface TweetDetailRequest {
  /** Target tweet id to fetch detail thread. */
  detailId: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: TweetDetailOperationName;
  /** GraphQL queryId/docId used in URL path. */
  queryId?: string;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<TweetDetailVariables>;
  /** Partial feature overrides merged with defaults. */
  featuresOverride?: Partial<TweetDetailFeatures>;
  /** Partial field toggles overrides merged with defaults. */
  fieldTogglesOverride?: Partial<TweetDetailFieldToggles>;
}

/**
 * Fully materialized request payload sent to TweetDetail endpoint.
 */
export interface TweetDetailResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: TweetDetailOperationName;
  queryId: string;
  variables: TweetDetailVariables;
  features: TweetDetailFeatures;
  fieldToggles: TweetDetailFieldToggles;
}

/**
 * Standard GraphQL error payload.
 */
export interface TweetDetailGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface TweetDetailOriginalResponse {
  data?: TweetDetailData;
  errors?: TweetDetailGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 *
 * - Frequently-used branches are lifted to top-level fields.
 * - Full raw payload is preserved under `__original`.
 */
export interface TweetDetailResponse {
  instructions: TweetDetailInstruction[];
  entries: TweetDetailEntry[];
  tweets: TweetDetailTweetSummary[];
  focalTweet?: TweetDetailTweetSummary;
  cursorTop?: string;
  cursorBottom?: string;
  conversationTweetIds: string[];
  errors?: TweetDetailGraphQLError[];
  __original: TweetDetailOriginalResponse;
}

export interface TweetDetailData {
  threaded_conversation_with_injections_v2?: TweetDetailThreadedConversation;
}

export interface TweetDetailThreadedConversation {
  instructions?: TweetDetailInstruction[];
  metadata?: TweetDetailConversationMetadata;
}

export interface TweetDetailConversationMetadata {
  scribeConfig?: {
    page?: string;
  };
}

export type TweetDetailInstruction =
  | TweetDetailAddEntriesInstruction
  | TweetDetailClearCacheInstruction
  | TweetDetailTerminateTimelineInstruction
  | TweetDetailUnknownInstruction;

export interface TweetDetailAddEntriesInstruction {
  type: 'TimelineAddEntries';
  entries: TweetDetailEntry[];
}

export interface TweetDetailClearCacheInstruction {
  type: 'TimelineClearCache';
}

export interface TweetDetailTerminateTimelineInstruction {
  type: 'TimelineTerminateTimeline';
  direction?: 'Top' | 'Bottom' | string;
}

export interface TweetDetailUnknownInstruction {
  type?: string;
  direction?: string;
  entries?: TweetDetailEntry[];
  [key: string]: unknown;
}

export interface TweetDetailEntry {
  entryId: string;
  sortIndex?: string;
  content: TweetDetailEntryContent;
}

export type TweetDetailEntryContent =
  | TweetDetailItemEntryContent
  | TweetDetailCursorEntryContent
  | TweetDetailModuleEntryContent
  | TweetDetailUnknownEntryContent;

export interface TweetDetailItemEntryContent {
  __typename?: 'TimelineTimelineItem' | string;
  entryType?: 'TimelineTimelineItem' | string;
  itemContent?: TweetDetailTimelineItemContent;
  clientEventInfo?: TweetDetailClientEventInfo;
}

export interface TweetDetailCursorEntryContent {
  __typename?: 'TimelineTimelineCursor' | string;
  entryType?: 'TimelineTimelineCursor' | string;
  cursorType?: string;
  value?: string;
  displayTreatment?: TweetDetailCursorDisplayTreatment;
}

export interface TweetDetailCursorDisplayTreatment {
  actionText?: string;
  [key: string]: unknown;
}

export interface TweetDetailModuleEntryContent {
  __typename?: 'TimelineTimelineModule' | string;
  entryType?: 'TimelineTimelineModule' | string;
  displayType?: string;
  header?: TweetDetailModuleHeader;
  items?: TweetDetailModuleItem[];
  metadata?: TweetDetailModuleMetadata;
  clientEventInfo?: TweetDetailClientEventInfo;
}

export interface TweetDetailUnknownEntryContent {
  __typename?: string;
  [key: string]: unknown;
}

export interface TweetDetailModuleHeader {
  displayType?: string;
  sticky?: boolean;
  text?: string;
  socialContext?: TweetDetailModuleHeaderSocialContext;
}

export interface TweetDetailModuleHeaderSocialContext {
  contextType?: string;
  text?: string;
  type?: string;
}

export interface TweetDetailModuleMetadata {
  conversationMetadata?: {
    allTweetIds?: string[];
    enableDeduplication?: boolean;
  };
}

export interface TweetDetailModuleItem {
  entryId: string;
  item?: {
    clientEventInfo?: TweetDetailClientEventInfo;
    itemContent?: TweetDetailTimelineItemContent;
  };
}

export interface TweetDetailClientEventInfo {
  component?: string;
  element?: string;
  details?: {
    conversationDetails?: {
      conversationSection?: string;
    };
    timelinesDetails?: {
      injectionType?: string;
      controllerData?: string;
    };
  };
}

export interface TweetDetailTimelineItemContent {
  __typename?: 'TimelineTweet' | string;
  itemType?: 'TimelineTweet' | string;
  tweetDisplayType?: string;
  tweet_results?: {
    result?: TweetDetailTweetResult;
  };
}

export type TweetDetailTweetResult =
  | TweetDetailTweet
  | TweetDetailTweetWithVisibilityResults
  | TweetDetailTweetTombstone
  | TweetDetailUnknownTweetResult;

export interface TweetDetailTweetWithVisibilityResults {
  __typename?: 'TweetWithVisibilityResults' | string;
  tweet?: TweetDetailTweet;
  [key: string]: unknown;
}

export interface TweetDetailTweetTombstone {
  __typename?: 'TweetTombstone' | string;
  tombstone?: {
    text?: {
      text?: string;
    };
  };
  [key: string]: unknown;
}

export interface TweetDetailUnknownTweetResult {
  __typename?: string;
  [key: string]: unknown;
}

export interface TweetDetailTweet {
  __typename?: 'Tweet' | string;
  rest_id?: string;
  core?: TweetDetailTweetCore;
  edit_control?: TweetDetailEditControl;
  grok_analysis_button?: boolean;
  has_birdwatch_notes?: boolean;
  is_translatable?: boolean;
  legacy?: TweetDetailTweetLegacy;
  quick_promote_eligibility?: {
    eligibility?: string;
  };
  source?: string;
  unmention_data?: Record<string, unknown>;
  views?: TweetDetailViews;
}

export interface TweetDetailTweetCore {
  user_results?: {
    result?: TweetDetailUserResult;
  };
}

export interface TweetDetailEditControl {
  edit_tweet_ids?: string[];
  editable_until_msecs?: string;
  edits_remaining?: string;
  is_edit_eligible?: boolean;
}

export interface TweetDetailViews {
  count?: string;
  state?: string;
}

export type TweetDetailUserResult = TweetDetailUser | TweetDetailUnknownUserResult;

export interface TweetDetailUnknownUserResult {
  __typename?: string;
  [key: string]: unknown;
}

export interface TweetDetailUser {
  __typename?: 'User' | string;
  id?: string;
  rest_id?: string;
  core?: {
    created_at?: string;
    name?: string;
    screen_name?: string;
  };
  avatar?: {
    image_url?: string;
  };
  dm_permissions?: {
    can_dm?: boolean;
    can_dm_on_xchat?: boolean;
  };
  has_graduated_access?: boolean;
  is_blue_verified?: boolean;
  legacy?: TweetDetailUserLegacy;
  location?: {
    location?: string;
  };
  media_permissions?: {
    can_media_tag?: boolean;
  };
  parody_commentary_fan_label?: string;
  privacy?: {
    protected?: boolean;
  };
  professional?: TweetDetailUserProfessional;
  profile_image_shape?: string;
  relationship_perspectives?: {
    blocked_by?: boolean;
    blocking?: boolean;
    followed_by?: boolean;
    following?: boolean;
    muting?: boolean;
  };
  super_follow_eligible?: boolean;
  super_followed_by?: boolean;
  super_following?: boolean;
  verification?: {
    verified?: boolean;
  };
}

export interface TweetDetailUserProfessional {
  professional_type?: string;
  rest_id?: string;
  category?: TweetDetailUserProfessionalCategory[];
}

export interface TweetDetailUserProfessionalCategory {
  id?: number;
  name?: string;
  icon_name?: string;
}

export interface TweetDetailUserLegacy {
  description?: string;
  entities?: TweetDetailUserEntities;
  fast_followers_count?: number;
  favourites_count?: number;
  follow_request_sent?: boolean;
  followers_count?: number;
  friends_count?: number;
  has_custom_timelines?: boolean;
  is_translator?: boolean;
  listed_count?: number;
  media_count?: number;
  normal_followers_count?: number;
  notifications?: boolean;
  pinned_tweet_ids_str?: string[];
  possibly_sensitive?: boolean;
  profile_banner_url?: string;
  profile_image_url_https?: string;
  profile_interstitial_type?: string;
  statuses_count?: number;
  translator_type?: string;
  url?: string;
  verified?: boolean;
  want_retweets?: boolean;
  withheld_in_countries?: string[];
  default_profile?: boolean;
  default_profile_image?: boolean;
}

/**
 * Lifted top-level author fields for easier consumption.
 */
export interface TweetDetailUserSummary {
  userId?: string;
  name?: string;
  screenName?: string;
  verified?: boolean;
  profileImageUrl?: string;
}

/**
 * Lifted top-level engagement metrics for easier consumption.
 */
export interface TweetDetailTweetStats {
  replyCount?: number;
  retweetCount?: number;
  likeCount?: number;
  quoteCount?: number;
  bookmarkCount?: number;
}

/**
 * Lifted top-level viewer state for easier consumption.
 */
export interface TweetDetailViewerState {
  bookmarked?: boolean;
  favorited?: boolean;
  retweeted?: boolean;
}

/**
 * Normalized tweet shape extracted from detail timeline branches.
 */
export interface TweetDetailTweetSummary {
  entryId: string;
  sortIndex?: string;
  tweetId?: string;
  fullText?: string;
  createdAt?: string;
  language?: string;
  source?: string;
  inReplyToTweetId?: string;
  inReplyToUserId?: string;
  viewCount?: string;
  user?: TweetDetailUserSummary;
  stats?: TweetDetailTweetStats;
  viewerState?: TweetDetailViewerState;
}

export interface TweetDetailUserEntities {
  description?: {
    urls?: TweetDetailUrlEntity[];
  };
  url?: {
    urls?: TweetDetailUrlEntity[];
  };
}

export interface TweetDetailTweetLegacy {
  bookmark_count?: number;
  bookmarked?: boolean;
  conversation_id_str?: string;
  created_at?: string;
  display_text_range?: number[];
  entities?: TweetDetailTweetEntities;
  extended_entities?: TweetDetailExtendedEntities;
  favorite_count?: number;
  favorited?: boolean;
  full_text?: string;
  id_str?: string;
  in_reply_to_screen_name?: string;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id_str?: string;
  is_quote_status?: boolean;
  lang?: string;
  possibly_sensitive?: boolean;
  possibly_sensitive_editable?: boolean;
  quote_count?: number;
  reply_count?: number;
  retweet_count?: number;
  retweeted?: boolean;
  user_id_str?: string;
}

export interface TweetDetailTweetEntities {
  hashtags?: TweetDetailHashtagEntity[];
  symbols?: TweetDetailSymbolEntity[];
  timestamps?: TweetDetailTimestampEntity[];
  urls?: TweetDetailUrlEntity[];
  user_mentions?: TweetDetailUserMentionEntity[];
  media?: TweetDetailMediaEntity[];
}

export interface TweetDetailExtendedEntities {
  media?: TweetDetailMediaEntity[];
}

export interface TweetDetailHashtagEntity {
  text?: string;
  indices?: number[];
}

export interface TweetDetailSymbolEntity {
  text?: string;
  indices?: number[];
}

export interface TweetDetailTimestampEntity {
  text?: string;
  indices?: number[];
}

export interface TweetDetailUrlEntity {
  url?: string;
  expanded_url?: string;
  display_url?: string;
  indices?: number[];
}

export interface TweetDetailUserMentionEntity {
  id_str?: string;
  name?: string;
  screen_name?: string;
  indices?: number[];
}

export interface TweetDetailMediaEntity {
  id_str?: string;
  media_key?: string;
  media_url_https?: string;
  url?: string;
  display_url?: string;
  expanded_url?: string;
  indices?: number[];
  type?: string;
  allow_download_status?: {
    allow_download?: boolean;
  };
  ext_media_availability?: {
    status?: string;
  };
  media_results?: {
    result?: {
      media_key?: string;
      [key: string]: unknown;
    };
  };
  features?: TweetDetailMediaFeatureMap;
  original_info?: TweetDetailMediaOriginalInfo;
  sizes?: TweetDetailMediaSizeMap;
}

export interface TweetDetailMediaFeatureMap {
  large?: TweetDetailMediaFeatureFaces;
  medium?: TweetDetailMediaFeatureFaces;
  small?: TweetDetailMediaFeatureFaces;
  orig?: TweetDetailMediaFeatureFaces;
  [sizeKey: string]: TweetDetailMediaFeatureFaces | undefined;
}

export interface TweetDetailMediaFeatureFaces {
  faces?: TweetDetailMediaFace[];
}

export interface TweetDetailMediaFace {
  h: number;
  w: number;
  x: number;
  y: number;
}

export interface TweetDetailMediaOriginalInfo {
  width?: number;
  height?: number;
  focus_rects?: TweetDetailMediaFocusRect[];
}

export interface TweetDetailMediaFocusRect {
  h: number;
  w: number;
  x: number;
  y: number;
}

export interface TweetDetailMediaSizeMap {
  large?: TweetDetailMediaSize;
  medium?: TweetDetailMediaSize;
  small?: TweetDetailMediaSize;
  thumb?: TweetDetailMediaSize;
  [sizeKey: string]: TweetDetailMediaSize | undefined;
}

export interface TweetDetailMediaSize {
  h?: number;
  w?: number;
  resize?: string;
}
