import type {
  HomeLatestTimelineFeatures,
  HomeLatestTimelineOperationName,
  HomeLatestTimelineRequest,
  HomeLatestTimelineResolvedRequest,
  HomeLatestTimelineVariables
} from './types';

export const DEFAULT_HOME_LATEST_TIMELINE_ENDPOINT =
  '/i/api/graphql/Odyc0iCUHiGTk7LkJLGvyQ/HomeLatestTimeline';

export const DEFAULT_HOME_LATEST_TIMELINE_QUERY_ID = 'Odyc0iCUHiGTk7LkJLGvyQ';

export const DEFAULT_HOME_LATEST_TIMELINE_OPERATION_NAME: HomeLatestTimelineOperationName =
  'HomeLatestTimeline';

export const DEFAULT_HOME_LATEST_TIMELINE_VARIABLES: HomeLatestTimelineVariables = {
  count: 20,
  enableRanking: false,
  includePromotedContent: false,
  requestContext: 'launch',
  seenTweetIds: []
};

export const DEFAULT_HOME_LATEST_TIMELINE_FEATURES: HomeLatestTimelineFeatures = {
  rweb_video_screen_enabled: false,
  profile_label_improvements_pcf_label_in_post_enabled: true,
  responsive_web_profile_redirect_enabled: false,
  rweb_tipjar_consumption_enabled: false,
  verified_phone_label_enabled: false,
  creator_subscriptions_tweet_preview_api_enabled: true,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  premium_content_api_read_enabled: false,
  communities_web_enable_tweet_community_results_fetch: true,
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  responsive_web_grok_analyze_button_fetch_trends_enabled: false,
  responsive_web_grok_analyze_post_followups_enabled: true,
  responsive_web_jetfuel_frame: true,
  responsive_web_grok_share_attachment_enabled: true,
  responsive_web_grok_annotations_enabled: true,
  articles_preview_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
  tweet_awards_web_tipping_enabled: false,
  responsive_web_grok_show_grok_translated_post: false,
  responsive_web_grok_analysis_button_from_backend: true,
  post_ctas_fetch_enabled: true,
  freedom_of_speech_not_reach_fetch_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  longform_notetweets_rich_text_read_enabled: true,
  longform_notetweets_inline_media_enabled: true,
  responsive_web_grok_image_annotation_enabled: true,
  responsive_web_grok_imagine_annotation_enabled: true,
  responsive_web_grok_community_note_auto_translation_is_enabled: false,
  responsive_web_enhance_cards_enabled: false
};

export function buildHomeLatestTimelineRequest(
  input: HomeLatestTimelineRequest = {}
): HomeLatestTimelineResolvedRequest {
  const variables = mergeDefined(DEFAULT_HOME_LATEST_TIMELINE_VARIABLES, input.variablesOverride);
  const features = mergeDefined(DEFAULT_HOME_LATEST_TIMELINE_FEATURES, input.featuresOverride);

  if (input.count !== undefined) {
    variables.count = input.count;
  }

  if (input.enableRanking !== undefined) {
    variables.enableRanking = input.enableRanking;
  }

  if (input.includePromotedContent !== undefined) {
    variables.includePromotedContent = input.includePromotedContent;
  }

  if (input.requestContext !== undefined) {
    variables.requestContext = input.requestContext;
  }

  if (input.seenTweetIds !== undefined) {
    variables.seenTweetIds = input.seenTweetIds;
  }

  if (input.cursor !== undefined) {
    variables.cursor = input.cursor;
  }

  return {
    endpoint: input.endpoint ?? DEFAULT_HOME_LATEST_TIMELINE_ENDPOINT,
    headers: input.headers,
    operationName: input.operationName ?? DEFAULT_HOME_LATEST_TIMELINE_OPERATION_NAME,
    queryId: input.queryId ?? DEFAULT_HOME_LATEST_TIMELINE_QUERY_ID,
    variables,
    features
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
