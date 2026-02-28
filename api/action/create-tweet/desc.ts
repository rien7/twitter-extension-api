import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_CREATE_TWEET_ENDPOINT,
  DEFAULT_CREATE_TWEET_FEATURES,
  DEFAULT_CREATE_TWEET_OPERATION_NAME,
  DEFAULT_CREATE_TWEET_QUERY_ID,
  DEFAULT_CREATE_TWEET_VARIABLES
} from './default';

export const CREATE_TWEET_DESC_TEXT = [
  '[create-tweet]',
  'Purpose: Publish a tweet in direct, reply, or quote mode.',
  'Call: window.x.api.action.createTweet(input)',
  'Input:',
  '  Required:',
  '    - tweetText',
  '  Optional:',
  '    - mode (direct | reply | quote)',
  '    - inReplyToTweetId (reply mode)',
  '    - excludeReplyUserIds (reply mode)',
  '    - attachmentUrl (quote mode)',
  '    - quoteTweetId (quote mode)',
  '    - mediaEntities',
  '    - mediaIds',
  '    - possiblySensitive',
  '    - semanticAnnotationIds',
  '    - disallowedReplyOptions',
  '    - endpoint',
  '    - headers',
  '    - queryId',
  '    - operationName',
  '    - darkRequest',
  '    - variablesOverride',
  '    - featuresOverride',
  'Returns: success, mode, resultTweet, errors'
].join('\n');

const CREATE_TWEET_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_CREATE_TWEET_ENDPOINT,
  queryId: DEFAULT_CREATE_TWEET_QUERY_ID,
  operationName: DEFAULT_CREATE_TWEET_OPERATION_NAME,
  variables: {
    ...DEFAULT_CREATE_TWEET_VARIABLES,
    media: {
      ...DEFAULT_CREATE_TWEET_VARIABLES.media,
      media_entities: [...DEFAULT_CREATE_TWEET_VARIABLES.media.media_entities]
    },
    semantic_annotation_ids: [...DEFAULT_CREATE_TWEET_VARIABLES.semantic_annotation_ids],
    disallowed_reply_options: DEFAULT_CREATE_TWEET_VARIABLES.disallowed_reply_options
      ? [...DEFAULT_CREATE_TWEET_VARIABLES.disallowed_reply_options]
      : null
  },
  features: { ...DEFAULT_CREATE_TWEET_FEATURES }
});

export function getCreateTweetDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(CREATE_TWEET_DEFAULT_PARAMS_TEMPLATE);
}

export const createTweetMeta: XApiMeta = {
  id: 'create-tweet',
  title: 'Create Tweet',
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/CreateTweet',
    operationName: 'CreateTweet'
  },
  requestTypeName: 'CreateTweetRequest',
  responseTypeName: 'CreateTweetResponse'
};
