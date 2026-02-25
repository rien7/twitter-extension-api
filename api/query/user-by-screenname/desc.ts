import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_USER_BY_SCREEN_NAME_ENDPOINT,
  DEFAULT_USER_BY_SCREEN_NAME_FEATURES,
  DEFAULT_USER_BY_SCREEN_NAME_FIELD_TOGGLES,
  DEFAULT_USER_BY_SCREEN_NAME_OPERATION_NAME,
  DEFAULT_USER_BY_SCREEN_NAME_QUERY_ID,
  DEFAULT_USER_BY_SCREEN_NAME_VARIABLES
} from './default';

export const USER_BY_SCREEN_NAME_DESC_TEXT = [
  '[user-by-screenname]',
  'Purpose: Fetch one user profile by screen name.',
  'Call: window.x.api.query.userByScreenName(input)',
  'Input:',
  '  Required:',
  '    - screenName',
  '  Optional:',
  '    - withGrokTranslatedBio',
  '    - variablesOverride',
  '    - featuresOverride',
  '    - fieldTogglesOverride',
  'Returns: found, user, capabilities, unavailableReason, errors'
].join('\n');

const USER_BY_SCREEN_NAME_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_USER_BY_SCREEN_NAME_ENDPOINT,
  queryId: DEFAULT_USER_BY_SCREEN_NAME_QUERY_ID,
  operationName: DEFAULT_USER_BY_SCREEN_NAME_OPERATION_NAME,
  variables: { ...DEFAULT_USER_BY_SCREEN_NAME_VARIABLES },
  features: { ...DEFAULT_USER_BY_SCREEN_NAME_FEATURES },
  fieldToggles: { ...DEFAULT_USER_BY_SCREEN_NAME_FIELD_TOGGLES }
});

export function getUserByScreenNameDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(
    USER_BY_SCREEN_NAME_DEFAULT_PARAMS_TEMPLATE
  );
}

export const userByScreenNameMeta: XApiMeta = {
  id: 'user-by-screenname',
  title: 'User By Screen Name',
  match: {
    method: 'GET',
    path: '/i/api/graphql/*/UserByScreenName',
    operationName: 'UserByScreenName',
    variablesShapeHash: '80ab4110'
  },
  requestTypeName: 'UserByScreenNameRequest',
  responseTypeName: 'UserByScreenNameResponse'
};
