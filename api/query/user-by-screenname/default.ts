import type {
  UserByScreenNameFeatures,
  UserByScreenNameFieldToggles,
  UserByScreenNameOperationName,
  UserByScreenNameRequest,
  UserByScreenNameResolvedRequest,
  UserByScreenNameVariables
} from './types';

export const DEFAULT_USER_BY_SCREEN_NAME_QUERY_ID = 'DYkHHnsQHOuIl0gUzU5Fjg';

export const DEFAULT_USER_BY_SCREEN_NAME_OPERATION_NAME: UserByScreenNameOperationName =
  'UserByScreenName';

export const DEFAULT_USER_BY_SCREEN_NAME_ENDPOINT = buildUserByScreenNameEndpoint(
  DEFAULT_USER_BY_SCREEN_NAME_QUERY_ID,
  DEFAULT_USER_BY_SCREEN_NAME_OPERATION_NAME
);

export const DEFAULT_USER_BY_SCREEN_NAME_VARIABLES: UserByScreenNameVariables = {
  screen_name: '',
  withGrokTranslatedBio: false
};

export const DEFAULT_USER_BY_SCREEN_NAME_FEATURES: UserByScreenNameFeatures = {
  hidden_profile_subscriptions_enabled: true,
  profile_label_improvements_pcf_label_in_post_enabled: true,
  responsive_web_profile_redirect_enabled: false,
  rweb_tipjar_consumption_enabled: false,
  verified_phone_label_enabled: false,
  subscriptions_verification_info_is_identity_verified_enabled: true,
  subscriptions_verification_info_verified_since_enabled: true,
  highlights_tweets_tab_ui_enabled: true,
  responsive_web_twitter_article_notes_tab_enabled: true,
  subscriptions_feature_can_gift_premium: true,
  creator_subscriptions_tweet_preview_api_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true
};

export const DEFAULT_USER_BY_SCREEN_NAME_FIELD_TOGGLES: UserByScreenNameFieldToggles = {
  withPayments: false,
  withAuxiliaryUserLabels: true
};

export function buildUserByScreenNameRequest(
  input: UserByScreenNameRequest
): UserByScreenNameResolvedRequest {
  const screenName = normalizeScreenName(input.screenName);
  const variables = mergeDefined(
    DEFAULT_USER_BY_SCREEN_NAME_VARIABLES,
    input.variablesOverride
  );
  const features = mergeDefined(
    DEFAULT_USER_BY_SCREEN_NAME_FEATURES,
    input.featuresOverride
  );
  const fieldToggles = mergeDefined(
    DEFAULT_USER_BY_SCREEN_NAME_FIELD_TOGGLES,
    input.fieldTogglesOverride
  );

  variables.screen_name = screenName;

  if (input.withGrokTranslatedBio !== undefined) {
    variables.withGrokTranslatedBio = input.withGrokTranslatedBio;
  }

  const operationName = input.operationName ?? DEFAULT_USER_BY_SCREEN_NAME_OPERATION_NAME;
  const queryId = input.queryId ?? DEFAULT_USER_BY_SCREEN_NAME_QUERY_ID;

  return {
    endpoint: input.endpoint ?? buildUserByScreenNameEndpoint(queryId, operationName),
    headers: input.headers,
    operationName,
    queryId,
    variables,
    features,
    fieldToggles
  };
}

export function buildUserByScreenNameEndpoint(
  queryId: string,
  operationName: UserByScreenNameOperationName
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

function normalizeScreenName(screenName: string): string {
  const trimmed = screenName.trim();
  const normalized = trimmed.startsWith('@') ? trimmed.slice(1).trim() : trimmed;

  if (!normalized) {
    throw new Error('user-by-screenname requires a non-empty screenName');
  }

  return normalized;
}
