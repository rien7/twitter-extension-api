import type {
  CreateTweetFeatures,
  CreateTweetMode,
  CreateTweetOperationName,
  CreateTweetQuoteRequest,
  CreateTweetReplyRequest,
  CreateTweetRequest,
  CreateTweetResolvedRequest,
  CreateTweetVariables,
  CreateTweetVariablesOverride
} from './types';

export const DEFAULT_CREATE_TWEET_QUERY_ID = 'y362cgN7cwMppu6Hy3JzrQ';

export const DEFAULT_CREATE_TWEET_OPERATION_NAME: CreateTweetOperationName = 'CreateTweet';

export const DEFAULT_CREATE_TWEET_ENDPOINT =
  `/i/api/graphql/${DEFAULT_CREATE_TWEET_QUERY_ID}/${DEFAULT_CREATE_TWEET_OPERATION_NAME}`;

export const DEFAULT_CREATE_TWEET_VARIABLES: CreateTweetVariables = {
  tweet_text: '',
  dark_request: false,
  media: {
    media_entities: [],
    possibly_sensitive: false
  },
  semantic_annotation_ids: [],
  disallowed_reply_options: null
};

export const DEFAULT_CREATE_TWEET_FEATURES: CreateTweetFeatures = {
  premium_content_api_read_enabled: false,
  communities_web_enable_tweet_community_results_fetch: true,
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  responsive_web_grok_analyze_button_fetch_trends_enabled: false,
  responsive_web_grok_analyze_post_followups_enabled: true,
  responsive_web_jetfuel_frame: true,
  responsive_web_grok_share_attachment_enabled: true,
  responsive_web_grok_annotations_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
  tweet_awards_web_tipping_enabled: false,
  content_disclosure_indicator_enabled: false,
  content_disclosure_ai_generated_indicator_enabled: false,
  responsive_web_grok_show_grok_translated_post: false,
  responsive_web_grok_analysis_button_from_backend: true,
  post_ctas_fetch_enabled: true,
  longform_notetweets_rich_text_read_enabled: true,
  longform_notetweets_inline_media_enabled: true,
  profile_label_improvements_pcf_label_in_post_enabled: true,
  responsive_web_profile_redirect_enabled: false,
  rweb_tipjar_consumption_enabled: false,
  verified_phone_label_enabled: false,
  articles_preview_enabled: true,
  responsive_web_grok_community_note_auto_translation_is_enabled: false,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  freedom_of_speech_not_reach_fetch_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  responsive_web_grok_image_annotation_enabled: true,
  responsive_web_grok_imagine_annotation_enabled: true,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_enhance_cards_enabled: false
};

export function buildCreateTweetRequest(input: CreateTweetRequest): CreateTweetResolvedRequest {
  if (!input.tweetText) {
    throw new Error('create-tweet requires a non-empty tweetText');
  }

  const mode = resolveCreateTweetMode(input);
  const variables = mergeCreateTweetVariables(DEFAULT_CREATE_TWEET_VARIABLES, input.variablesOverride);
  const features = mergeDefined(DEFAULT_CREATE_TWEET_FEATURES, input.featuresOverride);

  variables.tweet_text = input.tweetText;

  if (input.darkRequest !== undefined) {
    variables.dark_request = input.darkRequest;
  }

  if (input.mediaEntities !== undefined) {
    variables.media.media_entities = [...input.mediaEntities];
  } else if (input.mediaIds !== undefined) {
    variables.media.media_entities = buildMediaEntitiesFromIds(input.mediaIds);
  }

  if (input.possiblySensitive !== undefined) {
    variables.media.possibly_sensitive = input.possiblySensitive;
  }

  if (input.semanticAnnotationIds !== undefined) {
    variables.semantic_annotation_ids = [...input.semanticAnnotationIds];
  }

  if (input.disallowedReplyOptions !== undefined) {
    variables.disallowed_reply_options = input.disallowedReplyOptions
      ? [...input.disallowedReplyOptions]
      : null;
  }

  applyModeSpecificVariables(variables, mode, input);

  const operationName = input.operationName ?? DEFAULT_CREATE_TWEET_OPERATION_NAME;
  const queryId = input.queryId ?? DEFAULT_CREATE_TWEET_QUERY_ID;

  return {
    endpoint: input.endpoint ?? buildCreateTweetEndpoint(queryId, operationName),
    headers: input.headers,
    operationName,
    queryId,
    mode,
    variables,
    features
  };
}

export function buildCreateTweetEndpoint(
  queryId: string,
  operationName: CreateTweetOperationName
): string {
  return `/i/api/graphql/${queryId}/${operationName}`;
}

export function buildQuoteAttachmentUrl(quoteTweetId: string): string {
  return `https://x.com/i/status/${quoteTweetId}`;
}

function resolveCreateTweetMode(input: CreateTweetRequest): CreateTweetMode {
  if (input.mode) {
    return input.mode;
  }

  if ('inReplyToTweetId' in input && typeof input.inReplyToTweetId === 'string' && input.inReplyToTweetId) {
    return 'reply';
  }

  if ('attachmentUrl' in input && typeof input.attachmentUrl === 'string' && input.attachmentUrl) {
    return 'quote';
  }

  if ('quoteTweetId' in input && typeof input.quoteTweetId === 'string' && input.quoteTweetId) {
    return 'quote';
  }

  if (input.variablesOverride?.reply?.in_reply_to_tweet_id) {
    return 'reply';
  }

  if (input.variablesOverride?.attachment_url) {
    return 'quote';
  }

  return 'direct';
}

function applyModeSpecificVariables(
  variables: CreateTweetVariables,
  mode: CreateTweetMode,
  input: CreateTweetRequest
): void {
  if (mode === 'direct') {
    delete variables.reply;
    delete variables.attachment_url;
    return;
  }

  if (mode === 'quote') {
    const attachmentUrl = resolveQuoteAttachmentUrl(input);

    if (!attachmentUrl) {
      throw new Error('create-tweet quote mode requires attachmentUrl or quoteTweetId');
    }

    variables.attachment_url = attachmentUrl;
    delete variables.reply;
    return;
  }

  const inReplyToTweetId = resolveInReplyToTweetId(input);
  if (!inReplyToTweetId) {
    throw new Error('create-tweet reply mode requires inReplyToTweetId');
  }

  variables.reply = {
    in_reply_to_tweet_id: inReplyToTweetId,
    exclude_reply_user_ids: resolveExcludeReplyUserIds(input)
  };
  delete variables.attachment_url;
}

function resolveQuoteAttachmentUrl(input: CreateTweetRequest): string | undefined {
  if (isQuoteRequest(input) && input.attachmentUrl) {
    return input.attachmentUrl;
  }

  if (isQuoteRequest(input) && input.quoteTweetId) {
    return buildQuoteAttachmentUrl(input.quoteTweetId);
  }

  if (input.variablesOverride?.attachment_url) {
    return input.variablesOverride.attachment_url;
  }

  return undefined;
}

function resolveInReplyToTweetId(input: CreateTweetRequest): string | undefined {
  if (isReplyRequest(input) && input.inReplyToTweetId) {
    return input.inReplyToTweetId;
  }

  return input.variablesOverride?.reply?.in_reply_to_tweet_id;
}

function resolveExcludeReplyUserIds(input: CreateTweetRequest): string[] {
  if (isReplyRequest(input) && input.excludeReplyUserIds) {
    return [...input.excludeReplyUserIds];
  }

  if (input.variablesOverride?.reply?.exclude_reply_user_ids) {
    return [...input.variablesOverride.reply.exclude_reply_user_ids];
  }

  return [];
}

function isReplyRequest(input: CreateTweetRequest): input is CreateTweetReplyRequest {
  return input.mode === 'reply';
}

function isQuoteRequest(input: CreateTweetRequest): input is CreateTweetQuoteRequest {
  return input.mode === 'quote';
}

function buildMediaEntitiesFromIds(mediaIds: string[]): CreateTweetVariables['media']['media_entities'] {
  return mediaIds.map((mediaId, index) => {
    const normalizedMediaId = mediaId.trim();
    if (!normalizedMediaId) {
      throw new Error(`create-tweet mediaIds[${index}] must be a non-empty string`);
    }

    return {
      media_id: normalizedMediaId,
      tagged_users: []
    };
  });
}

function mergeCreateTweetVariables(
  base: CreateTweetVariables,
  overrides?: CreateTweetVariablesOverride
): CreateTweetVariables {
  const merged: CreateTweetVariables = {
    ...base,
    media: {
      ...base.media,
      media_entities: [...base.media.media_entities]
    },
    semantic_annotation_ids: [...base.semantic_annotation_ids],
    disallowed_reply_options: base.disallowed_reply_options ? [...base.disallowed_reply_options] : null
  };

  if (!overrides) {
    return merged;
  }

  if (overrides.tweet_text !== undefined) {
    merged.tweet_text = overrides.tweet_text;
  }

  if (overrides.dark_request !== undefined) {
    merged.dark_request = overrides.dark_request;
  }

  if (overrides.media) {
    if (overrides.media.media_entities !== undefined) {
      merged.media.media_entities = [...overrides.media.media_entities];
    }

    if (overrides.media.possibly_sensitive !== undefined) {
      merged.media.possibly_sensitive = overrides.media.possibly_sensitive;
    }
  }

  if (overrides.semantic_annotation_ids !== undefined) {
    merged.semantic_annotation_ids = [...overrides.semantic_annotation_ids];
  }

  if (overrides.disallowed_reply_options !== undefined) {
    merged.disallowed_reply_options = overrides.disallowed_reply_options
      ? [...overrides.disallowed_reply_options]
      : null;
  }

  if (overrides.attachment_url !== undefined) {
    merged.attachment_url = overrides.attachment_url;
  }

  if (overrides.reply) {
    const inReplyToTweetId =
      overrides.reply.in_reply_to_tweet_id ?? merged.reply?.in_reply_to_tweet_id;

    if (inReplyToTweetId !== undefined) {
      merged.reply = {
        in_reply_to_tweet_id: inReplyToTweetId,
        exclude_reply_user_ids: overrides.reply.exclude_reply_user_ids
          ? [...overrides.reply.exclude_reply_user_ids]
          : [...(merged.reply?.exclude_reply_user_ids ?? [])]
      };
    }
  }

  return merged;
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
