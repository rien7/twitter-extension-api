/**
 * FollowList GraphQL operation name captured from live traffic.
 */
export type FollowListOperationName = 'Following';

/**
 * Request variables used by Following query.
 */
export interface FollowListVariables {
  /** Target user id whose following list will be queried. */
  userId: string;
  /** Number of entries expected in one request. */
  count: number;
  /** Whether promoted entries should be included. */
  includePromotedContent: boolean;
  /** Whether translated bio should be requested. */
  withGrokTranslatedBio: boolean;
  /** Cursor token for pagination. */
  cursor?: string;
}

/**
 * Known feature switches observed in Following requests.
 * Extra feature flags may appear over time.
 */
export interface FollowListFeatures {
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
 * Public API input for follow-list.
 */
export interface FollowListRequest {
  /**
   * Target user id whose following list will be queried.
   * Defaults to self user id parsed from `twid` cookie at SDK initialization.
   */
  userId?: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: FollowListOperationName;
  /** GraphQL queryId/docId used in URL path. */
  queryId?: string;
  /** Convenience override for variables.count. */
  count?: number;
  /** Convenience override for variables.cursor. */
  cursor?: string;
  /** Convenience override for variables.includePromotedContent. */
  includePromotedContent?: boolean;
  /** Convenience override for variables.withGrokTranslatedBio. */
  withGrokTranslatedBio?: boolean;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<FollowListVariables>;
  /** Partial feature overrides merged with defaults. */
  featuresOverride?: Partial<FollowListFeatures>;
}

/**
 * Fully materialized request payload sent to Following endpoint.
 */
export interface FollowListResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: FollowListOperationName;
  queryId: string;
  variables: FollowListVariables;
  features: FollowListFeatures;
}

export interface FollowListGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface FollowListGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: FollowListGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface FollowListOriginalResponse {
  data?: FollowListData;
  errors?: FollowListGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface FollowListResponse {
  instructions: FollowListInstruction[];
  entries: FollowListEntry[];
  users: FollowListUserSummary[];
  cursorTop?: string;
  cursorBottom?: string;
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  errors?: FollowListGraphQLError[];
  __original: FollowListOriginalResponse;
}

export interface FollowListData {
  user?: FollowListUserBranch;
}

export interface FollowListUserBranch {
  result?: FollowListUserResultWrapper;
}

export interface FollowListUserResultWrapper {
  __typename?: string;
  timeline?: FollowListTimelineBranch;
}

export interface FollowListTimelineBranch {
  timeline?: FollowListTimeline;
}

export interface FollowListTimeline {
  instructions?: FollowListInstruction[];
}

export type FollowListInstruction =
  | FollowListAddEntriesInstruction
  | FollowListClearCacheInstruction
  | FollowListTerminateInstruction
  | FollowListUnknownInstruction;

export interface FollowListAddEntriesInstruction {
  type: 'TimelineAddEntries';
  entries: FollowListEntry[];
}

export interface FollowListClearCacheInstruction {
  type: 'TimelineClearCache';
}

export interface FollowListTerminateInstruction {
  type: 'TimelineTerminateTimeline';
  direction?: string;
}

export interface FollowListUnknownInstruction {
  type?: string;
  entries?: FollowListEntry[];
  [key: string]: unknown;
}

export interface FollowListEntry {
  entryId: string;
  sortIndex?: string;
  content: FollowListEntryContent;
}

export type FollowListEntryContent =
  | FollowListItemEntryContent
  | FollowListCursorEntryContent
  | FollowListUnknownEntryContent;

export interface FollowListItemEntryContent {
  __typename?: 'TimelineTimelineItem' | string;
  entryType?: 'TimelineTimelineItem' | string;
  itemContent?: FollowListUserItemContent;
}

export interface FollowListCursorEntryContent {
  __typename?: 'TimelineTimelineCursor' | string;
  entryType?: 'TimelineTimelineCursor' | string;
  cursorType?: 'Top' | 'Bottom' | string;
  value?: string;
}

export interface FollowListUnknownEntryContent {
  __typename?: string;
  [key: string]: unknown;
}

export interface FollowListUserItemContent {
  __typename?: 'TimelineUser' | string;
  itemType?: 'TimelineUser' | string;
  userDisplayType?: string;
  user_results?: {
    result?: FollowListTimelineUserResult;
  };
}

export type FollowListTimelineUserResult =
  | FollowListTimelineUser
  | FollowListTimelineUserUnavailable
  | FollowListUnknownTimelineUserResult;

export interface FollowListTimelineUser {
  __typename?: 'User' | string;
  id?: string;
  rest_id?: string;
  core?: FollowListTimelineUserCore;
  legacy?: FollowListTimelineUserLegacy;
  avatar?: FollowListTimelineUserAvatar;
  profile_bio?: FollowListTimelineUserBio;
  location?: FollowListTimelineUserLocation;
  privacy?: FollowListTimelineUserPrivacy;
  verification?: FollowListTimelineUserVerification;
  relationship_perspectives?: FollowListTimelineUserRelationship;
}

export interface FollowListTimelineUserCore {
  name?: string;
  screen_name?: string;
  created_at?: string;
}

export interface FollowListTimelineUserLegacy {
  name?: string;
  screen_name?: string;
  description?: string;
  followers_count?: number;
  friends_count?: number;
  profile_image_url?: string;
  profile_image_url_https?: string;
  verified?: boolean;
  protected?: boolean;
}

export interface FollowListTimelineUserAvatar {
  image_url?: string;
}

export interface FollowListTimelineUserBio {
  description?: string;
}

export interface FollowListTimelineUserLocation {
  location?: string;
}

export interface FollowListTimelineUserPrivacy {
  protected?: boolean;
}

export interface FollowListTimelineUserVerification {
  verified?: boolean;
}

export interface FollowListTimelineUserRelationship {
  followed_by?: boolean;
  following?: boolean;
  blocking?: boolean;
  blocked_by?: boolean;
  muting?: boolean;
}

export interface FollowListTimelineUserUnavailable {
  __typename?: string;
  reason?: string;
}

export interface FollowListUnknownTimelineUserResult {
  __typename?: string;
  [key: string]: unknown;
}

export interface FollowListUserSummary {
  entryId: string;
  sortIndex?: string;
  userId?: string;
  name?: string;
  screenName?: string;
  description?: string;
  location?: string;
  profileImageUrl?: string;
  followersCount?: number;
  friendsCount?: number;
  verified?: boolean;
  protected?: boolean;
  followedBy?: boolean;
  following?: boolean;
  blocking?: boolean;
  blockedBy?: boolean;
  muting?: boolean;
}
