import type { XActionResponseBase, XTweetSummary } from '../../../src/shared/types';

/**
 * CreateTweet GraphQL operation name captured from live traffic.
 */
export type CreateTweetOperationName = 'CreateTweet';

/**
 * Supported publish modes for CreateTweet.
 */
export type CreateTweetMode = 'direct' | 'reply' | 'quote';

/**
 * Media entity object accepted by CreateTweet variables.media.media_entities.
 */
export interface CreateTweetMediaEntity {
  media_id?: string;
  tagged_users?: string[];
  additional_owners?: string[];
  [key: string]: unknown;
}

/**
 * CreateTweet media payload.
 */
export interface CreateTweetMedia {
  media_entities: CreateTweetMediaEntity[];
  possibly_sensitive: boolean;
}

/**
 * Reply branch used by CreateTweet variables.reply.
 */
export interface CreateTweetReply {
  in_reply_to_tweet_id: string;
  exclude_reply_user_ids: string[];
}

/**
 * Request variables used by CreateTweet GraphQL mutation.
 */
export interface CreateTweetVariables {
  tweet_text: string;
  dark_request: boolean;
  media: CreateTweetMedia;
  semantic_annotation_ids: Array<string | number>;
  disallowed_reply_options: string[] | null;
  attachment_url?: string;
  reply?: CreateTweetReply;
}

/**
 * Partial variable overrides accepted by public API input.
 */
export interface CreateTweetVariablesOverride
  extends Partial<Omit<CreateTweetVariables, 'media' | 'reply'>> {
  media?: Partial<CreateTweetMedia>;
  reply?: Partial<CreateTweetReply>;
}

/**
 * Known feature switches observed in CreateTweet requests.
 * X can add/remove flags over time, so unknown keys are allowed.
 */
export interface CreateTweetFeatures {
  premium_content_api_read_enabled?: boolean;
  communities_web_enable_tweet_community_results_fetch?: boolean;
  c9s_tweet_anatomy_moderator_badge_enabled?: boolean;
  responsive_web_grok_analyze_button_fetch_trends_enabled?: boolean;
  responsive_web_grok_analyze_post_followups_enabled?: boolean;
  responsive_web_jetfuel_frame?: boolean;
  responsive_web_grok_share_attachment_enabled?: boolean;
  responsive_web_grok_annotations_enabled?: boolean;
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
  longform_notetweets_rich_text_read_enabled?: boolean;
  longform_notetweets_inline_media_enabled?: boolean;
  profile_label_improvements_pcf_label_in_post_enabled?: boolean;
  responsive_web_profile_redirect_enabled?: boolean;
  rweb_tipjar_consumption_enabled?: boolean;
  verified_phone_label_enabled?: boolean;
  articles_preview_enabled?: boolean;
  responsive_web_grok_community_note_auto_translation_is_enabled?: boolean;
  responsive_web_graphql_skip_user_profile_image_extensions_enabled?: boolean;
  freedom_of_speech_not_reach_fetch_enabled?: boolean;
  standardized_nudges_misinfo?: boolean;
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled?: boolean;
  responsive_web_grok_image_annotation_enabled?: boolean;
  responsive_web_grok_imagine_annotation_enabled?: boolean;
  responsive_web_graphql_timeline_navigation_enabled?: boolean;
  responsive_web_enhance_cards_enabled?: boolean;
  [featureKey: string]: boolean | undefined;
}

/**
 * Shared input fields for all CreateTweet modes.
 */
export interface CreateTweetBaseRequest {
  /** Tweet text content. */
  tweetText: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: CreateTweetOperationName;
  /** GraphQL queryId/docId used in URL path and request body. */
  queryId?: string;
  /** Convenience override for variables.dark_request. */
  darkRequest?: boolean;
  /** Convenience override for variables.media.media_entities. */
  mediaEntities?: CreateTweetMediaEntity[];
  /** Convenience override for media ids, mapped to `media_entities: [{ media_id }]`. */
  mediaIds?: string[];
  /** Convenience override for variables.media.possibly_sensitive. */
  possiblySensitive?: boolean;
  /** Convenience override for variables.semantic_annotation_ids. */
  semanticAnnotationIds?: Array<string | number>;
  /** Convenience override for variables.disallowed_reply_options. */
  disallowedReplyOptions?: string[] | null;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: CreateTweetVariablesOverride;
  /** Partial feature overrides merged with defaults. */
  featuresOverride?: Partial<CreateTweetFeatures>;
}

/**
 * Direct publish mode: post a standalone tweet.
 */
export interface CreateTweetDirectRequest extends CreateTweetBaseRequest {
  mode?: 'direct';
}

/**
 * Reply publish mode: post a reply to an existing tweet.
 */
export interface CreateTweetReplyRequest extends CreateTweetBaseRequest {
  mode: 'reply';
  inReplyToTweetId: string;
  excludeReplyUserIds?: string[];
}

/**
 * Quote publish mode: post a tweet quoting another tweet.
 */
export interface CreateTweetQuoteRequest extends CreateTweetBaseRequest {
  mode: 'quote';
  attachmentUrl?: string;
  quoteTweetId?: string;
}

/**
 * Public API input for create-tweet.
 */
export type CreateTweetRequest =
  | CreateTweetDirectRequest
  | CreateTweetReplyRequest
  | CreateTweetQuoteRequest;

/**
 * Fully materialized request payload sent to CreateTweet endpoint.
 */
export interface CreateTweetResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: CreateTweetOperationName;
  queryId: string;
  mode: CreateTweetMode;
  variables: CreateTweetVariables;
  features: CreateTweetFeatures;
}

/**
 * GraphQL error extension payload.
 */
export interface CreateTweetGraphQLErrorExtensions {
  code?: number;
  kind?: string;
  name?: string;
  source?: string;
  tracing?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface CreateTweetGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: CreateTweetGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface CreateTweetOriginalResponse {
  data?: CreateTweetData;
  errors?: CreateTweetGraphQLError[];
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface CreateTweetResponse
  extends XActionResponseBase<CreateTweetOriginalResponse, CreateTweetGraphQLError> {
  /** Publish mode requested by caller after defaults were resolved. */
  requestedMode: CreateTweetMode;
  /** Publish mode detected from response payload. */
  mode: CreateTweetMode;
  /** Created tweet summary extracted from mutation result branch. */
  resultTweet?: XTweetSummary;
}

export interface CreateTweetData {
  create_tweet?: CreateTweetCreateBranch;
}

export interface CreateTweetCreateBranch {
  tweet_results?: CreateTweetResultBranch;
}

export interface CreateTweetResultBranch {
  result?: CreateTweetResult;
  __typename?: string;
}

export type CreateTweetResult =
  | CreateTweetTweetResult
  | CreateTweetTweetWithVisibilityResult
  | CreateTweetUnknownResult;

export interface CreateTweetTweetWithVisibilityResult {
  __typename?: 'TweetWithVisibilityResults' | string;
  tweet?: CreateTweetTweetResult;
  [key: string]: unknown;
}

export interface CreateTweetUnknownResult {
  __typename?: string;
  [key: string]: unknown;
}

export interface CreateTweetTweetResult {
  __typename?: 'Tweet' | string;
  rest_id?: string;
  core?: CreateTweetCore;
  legacy?: CreateTweetLegacy;
  quoted_status_result?: {
    result?: CreateTweetResult;
  };
  [key: string]: unknown;
}

export interface CreateTweetCore {
  user_results?: {
    result?: {
      rest_id?: string;
    };
  };
}

export interface CreateTweetLegacy {
  id_str?: string;
  full_text?: string;
  user_id_str?: string;
  conversation_id_str?: string;
  in_reply_to_status_id_str?: string | null;
  in_reply_to_user_id_str?: string | null;
  in_reply_to_screen_name?: string | null;
  is_quote_status?: boolean;
  quoted_status_id_str?: string | null;
}
