import type { XResponseBase, XUserSummary } from '../../../src/shared/types';

/**
 * UserByScreenName GraphQL operation name captured from live traffic.
 */
export type UserByScreenNameOperationName = 'UserByScreenName';

/**
 * Request variables used by UserByScreenName GraphQL query.
 */
export interface UserByScreenNameVariables {
  /** Target profile handle, without leading `@`. */
  screen_name: string;
  /** Whether translated profile bio should be requested. */
  withGrokTranslatedBio: boolean;
}

/**
 * Known feature switches observed in UserByScreenName requests.
 * Additional flags may appear over time.
 */
export interface UserByScreenNameFeatures {
  hidden_profile_subscriptions_enabled?: boolean;
  profile_label_improvements_pcf_label_in_post_enabled?: boolean;
  responsive_web_profile_redirect_enabled?: boolean;
  rweb_tipjar_consumption_enabled?: boolean;
  verified_phone_label_enabled?: boolean;
  subscriptions_verification_info_is_identity_verified_enabled?: boolean;
  subscriptions_verification_info_verified_since_enabled?: boolean;
  highlights_tweets_tab_ui_enabled?: boolean;
  responsive_web_twitter_article_notes_tab_enabled?: boolean;
  subscriptions_feature_can_gift_premium?: boolean;
  creator_subscriptions_tweet_preview_api_enabled?: boolean;
  responsive_web_graphql_skip_user_profile_image_extensions_enabled?: boolean;
  responsive_web_graphql_timeline_navigation_enabled?: boolean;
  [featureKey: string]: boolean | undefined;
}

/**
 * Field toggles shipped with UserByScreenName requests.
 */
export interface UserByScreenNameFieldToggles {
  withPayments?: boolean;
  withAuxiliaryUserLabels?: boolean;
  [toggleKey: string]: boolean | undefined;
}

/**
 * Public API input for user-by-screenname query.
 */
export interface UserByScreenNameRequest {
  /** Target profile handle. Supports either `name` or `@name`. */
  screenName: string;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared GraphQL headers. */
  headers?: Record<string, string>;
  /** GraphQL operationName. */
  operationName?: UserByScreenNameOperationName;
  /** GraphQL queryId/docId used in URL path. */
  queryId?: string;
  /** Convenience override for variables.withGrokTranslatedBio. */
  withGrokTranslatedBio?: boolean;
  /** Partial variable overrides merged with defaults. */
  variablesOverride?: Partial<UserByScreenNameVariables>;
  /** Partial feature overrides merged with defaults. */
  featuresOverride?: Partial<UserByScreenNameFeatures>;
  /** Partial field toggle overrides merged with defaults. */
  fieldTogglesOverride?: Partial<UserByScreenNameFieldToggles>;
}

/**
 * Fully materialized request payload sent to UserByScreenName endpoint.
 */
export interface UserByScreenNameResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  operationName: UserByScreenNameOperationName;
  queryId: string;
  variables: UserByScreenNameVariables;
  features: UserByScreenNameFeatures;
  fieldToggles: UserByScreenNameFieldToggles;
}

export interface UserByScreenNameGraphQLErrorExtensions {
  [key: string]: unknown;
}

/**
 * Standard GraphQL error payload.
 */
export interface UserByScreenNameGraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: UserByScreenNameGraphQLErrorExtensions;
}

/**
 * Full GraphQL payload as returned by server.
 */
export interface UserByScreenNameOriginalResponse {
  data?: UserByScreenNameData;
  errors?: UserByScreenNameGraphQLError[];
}

/**
 * Normalized user summary returned by this API.
 */
export type UserByScreenNameUserSummary = XUserSummary;

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface UserByScreenNameResponse
  extends XResponseBase<UserByScreenNameOriginalResponse, UserByScreenNameGraphQLError> {
  found: boolean;
  resultType?: string;
  user?: UserByScreenNameUserSummary;
  unavailableReason?: string;
  capabilities?: UserByScreenNameCapabilities;
}

export interface UserByScreenNameCapabilities {
  isBlueVerified?: boolean;
  canDm?: boolean;
  canMediaTag?: boolean;
}

export interface UserByScreenNameData {
  user?: UserByScreenNameUserBranch;
}

export interface UserByScreenNameUserBranch {
  result?: UserByScreenNameUserResult;
}

export type UserByScreenNameUserResult =
  | UserByScreenNameUser
  | UserByScreenNameUnavailableUser
  | UserByScreenNameUnknownUserResult;

export interface UserByScreenNameUser {
  __typename?: 'User' | string;
  id?: string;
  rest_id?: string;
  core?: UserByScreenNameUserCore;
  legacy?: UserByScreenNameUserLegacy;
  avatar?: UserByScreenNameUserAvatar;
  profile_bio?: UserByScreenNameUserBio;
  location?: UserByScreenNameUserLocation;
  privacy?: UserByScreenNameUserPrivacy;
  verification?: UserByScreenNameUserVerification;
  relationship_perspectives?: UserByScreenNameUserRelationship;
  dm_permissions?: UserByScreenNameUserDmPermissions;
  media_permissions?: UserByScreenNameUserMediaPermissions;
  is_blue_verified?: boolean;
}

export interface UserByScreenNameUserCore {
  created_at?: string;
  name?: string;
  screen_name?: string;
}

export interface UserByScreenNameUserLegacy {
  name?: string;
  screen_name?: string;
  description?: string;
  followers_count?: number;
  friends_count?: number;
  verified?: boolean;
  protected?: boolean;
  want_retweets?: boolean;
  profile_image_url_https?: string;
}

export interface UserByScreenNameUserAvatar {
  image_url?: string;
}

export interface UserByScreenNameUserBio {
  description?: string;
}

export interface UserByScreenNameUserLocation {
  location?: string;
}

export interface UserByScreenNameUserPrivacy {
  protected?: boolean;
}

export interface UserByScreenNameUserVerification {
  verified?: boolean;
}

export interface UserByScreenNameUserRelationship {
  following?: boolean;
  followed_by?: boolean;
  blocking?: boolean;
  blocked_by?: boolean;
  muting?: boolean;
}

export interface UserByScreenNameUserDmPermissions {
  can_dm?: boolean;
}

export interface UserByScreenNameUserMediaPermissions {
  can_media_tag?: boolean;
}

export interface UserByScreenNameUnavailableUser {
  __typename?: 'UserUnavailable' | string;
  reason?: string;
  message?: string;
  unavailable_message?: string;
  [key: string]: unknown;
}

export interface UserByScreenNameUnknownUserResult {
  __typename?: string;
  [key: string]: unknown;
}
