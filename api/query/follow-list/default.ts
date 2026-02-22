import type {
  FollowListFeatures,
  FollowListOperationName,
  FollowListRequest,
  FollowListResolvedRequest,
  FollowListVariables
} from './types';
import { resolveSelfUserIdOrThrow } from '../../../src/sdk/self-user-id';

export const DEFAULT_FOLLOW_LIST_QUERY_ID = 'T5wihsMTYHncY7BB4YxHSg';

export const DEFAULT_FOLLOW_LIST_OPERATION_NAME: FollowListOperationName = 'Following';

export const DEFAULT_FOLLOW_LIST_ENDPOINT = buildFollowListEndpoint(
  DEFAULT_FOLLOW_LIST_QUERY_ID,
  DEFAULT_FOLLOW_LIST_OPERATION_NAME
);

export const DEFAULT_FOLLOW_LIST_VARIABLES: FollowListVariables = {
  userId: '',
  count: 20,
  includePromotedContent: false,
  withGrokTranslatedBio: false
};

export const DEFAULT_FOLLOW_LIST_FEATURES: FollowListFeatures = {
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

export function buildFollowListRequest(input: FollowListRequest = {}): FollowListResolvedRequest {
  const requestedUserId = resolveTargetUserId(input.userId);
  const variables = mergeDefined(DEFAULT_FOLLOW_LIST_VARIABLES, input.variablesOverride);
  const features = mergeDefined(DEFAULT_FOLLOW_LIST_FEATURES, input.featuresOverride);

  variables.userId = requestedUserId;

  if (input.count !== undefined) {
    variables.count = input.count;
  }

  if (input.cursor !== undefined) {
    variables.cursor = input.cursor;
  }

  if (input.includePromotedContent !== undefined) {
    variables.includePromotedContent = input.includePromotedContent;
  }

  if (input.withGrokTranslatedBio !== undefined) {
    variables.withGrokTranslatedBio = input.withGrokTranslatedBio;
  }

  const operationName = input.operationName ?? DEFAULT_FOLLOW_LIST_OPERATION_NAME;
  const queryId = input.queryId ?? DEFAULT_FOLLOW_LIST_QUERY_ID;

  return {
    endpoint: input.endpoint ?? buildFollowListEndpoint(queryId, operationName),
    headers: input.headers,
    operationName,
    queryId,
    variables,
    features
  };
}

export function buildFollowListEndpoint(
  queryId: string,
  operationName: FollowListOperationName
): string {
  return `/i/api/graphql/${queryId}/${operationName}`;
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

function resolveTargetUserId(inputUserId: string | undefined): string {
  const explicitUserId = inputUserId?.trim();
  if (explicitUserId) {
    return explicitUserId;
  }

  return resolveSelfUserIdOrThrow('follow-list');
}
