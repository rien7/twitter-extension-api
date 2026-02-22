import type {
  TweetDetailFeatures,
  TweetDetailFieldToggles,
  TweetDetailOperationName,
  TweetDetailRequest,
  TweetDetailResolvedRequest,
  TweetDetailVariables
} from './types';

export const DEFAULT_TWEET_DETAIL_ENDPOINT =
  '/i/api/graphql/JgryuItLZQ9V56vHjGIWWw/TweetDetail';

export const DEFAULT_TWEET_DETAIL_QUERY_ID = 'JgryuItLZQ9V56vHjGIWWw';

export const DEFAULT_TWEET_DETAIL_OPERATION_NAME: TweetDetailOperationName = 'TweetDetail';

export const DEFAULT_TWEET_DETAIL_VARIABLES: TweetDetailVariables = {
  includePromotedContent: false,
  rankingMode: 'Relevance',
  referrer: 'Home',
  withBirdwatchNotes: true,
  withCommunity: true,
  withQuickPromoteEligibilityTweetFields: true,
  withVoice: true,
  with_rux_injections: false,
  focalTweetId: ''
};

export const DEFAULT_TWEET_DETAIL_FEATURES: TweetDetailFeatures = {
  articles_preview_enabled: true,
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  communities_web_enable_tweet_community_results_fetch: true,
  creator_subscriptions_quote_tweet_preview_enabled: false,
  creator_subscriptions_tweet_preview_api_enabled: true,
  freedom_of_speech_not_reach_fetch_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  interactive_text_enabled: true,
  longform_notetweets_consumption_enabled: true,
  longform_notetweets_inline_media_enabled: true,
  longform_notetweets_rich_text_read_enabled: true,
  payments_enabled: false,
  premium_content_api_read_enabled: false,
  profile_label_improvements_pcf_label_in_post_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  responsive_web_enhance_cards_enabled: false,
  responsive_web_graphql_exclude_directive_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_grok_analysis_button_from_backend: true,
  responsive_web_grok_analyze_button_fetch_trends_enabled: false,
  responsive_web_grok_analyze_post_followups_enabled: true,
  responsive_web_grok_community_note_auto_translation_is_enabled: false,
  responsive_web_grok_image_annotation_enabled: true,
  responsive_web_grok_imagine_annotation_enabled: true,
  responsive_web_grok_share_attachment_enabled: true,
  responsive_web_grok_show_grok_translated_post: false,
  responsive_web_jetfuel_frame: true,
  responsive_web_text_conversations_enabled: false,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
  rweb_tipjar_consumption_enabled: true,
  rweb_video_screen_enabled: false,
  standardized_nudges_misinfo: true,
  tweet_awards_web_tipping_enabled: false,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  verified_phone_label_enabled: false,
  vibe_api_enabled: true,
  view_counts_everywhere_api_enabled: true
};

export const DEFAULT_TWEET_DETAIL_FIELD_TOGGLES: TweetDetailFieldToggles = {
  withArticlePlainText: false,
  withArticleRichContentState: true,
  withAuxiliaryUserLabels: false,
  withCategoryGoodId: false,
  withDisallowedReplyControls: false,
  withGrokAnalyze: false,
  withSawaraEnabled: false
};

export function buildTweetDetailRequest(input: TweetDetailRequest): TweetDetailResolvedRequest {
  if (!input.detailId) {
    throw new Error('tweet-detail requires a non-empty detailId');
  }

  const variables = mergeDefined(DEFAULT_TWEET_DETAIL_VARIABLES, input.variablesOverride);
  const features = mergeDefined(DEFAULT_TWEET_DETAIL_FEATURES, input.featuresOverride);
  const fieldToggles = mergeDefined(DEFAULT_TWEET_DETAIL_FIELD_TOGGLES, input.fieldTogglesOverride);

  variables.focalTweetId = input.detailId;

  return {
    endpoint: input.endpoint ?? DEFAULT_TWEET_DETAIL_ENDPOINT,
    headers: input.headers,
    operationName: input.operationName ?? DEFAULT_TWEET_DETAIL_OPERATION_NAME,
    queryId: input.queryId ?? DEFAULT_TWEET_DETAIL_QUERY_ID,
    variables,
    features,
    fieldToggles
  };
}

function mergeDefined<T extends object>(base: T, overrides?: Partial<T>): T {
  const merged = { ...base };

  if (!overrides) {
    return merged;
  }

  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const value = overrides[key];
    if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}
