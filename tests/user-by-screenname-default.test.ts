import { describe, expect, it } from 'vitest';

import {
  DEFAULT_USER_BY_SCREEN_NAME_FEATURES,
  DEFAULT_USER_BY_SCREEN_NAME_FIELD_TOGGLES,
  DEFAULT_USER_BY_SCREEN_NAME_OPERATION_NAME,
  DEFAULT_USER_BY_SCREEN_NAME_QUERY_ID,
  DEFAULT_USER_BY_SCREEN_NAME_VARIABLES,
  buildUserByScreenNameRequest
} from '../api/query/user-by-screenname/default';

describe('userByScreenName defaults', () => {
  it('builds a request from defaults and required screenName', () => {
    const request = buildUserByScreenNameRequest({
      screenName: 'Twitter'
    });

    expect(request.operationName).toBe(DEFAULT_USER_BY_SCREEN_NAME_OPERATION_NAME);
    expect(request.queryId).toBe(DEFAULT_USER_BY_SCREEN_NAME_QUERY_ID);
    expect(request.variables).toEqual({
      ...DEFAULT_USER_BY_SCREEN_NAME_VARIABLES,
      screen_name: 'Twitter'
    });
    expect(request.features).toEqual(DEFAULT_USER_BY_SCREEN_NAME_FEATURES);
    expect(request.fieldToggles).toEqual(DEFAULT_USER_BY_SCREEN_NAME_FIELD_TOGGLES);
  });

  it('allows overrides while keeping screenName as highest-priority field', () => {
    const request = buildUserByScreenNameRequest({
      screenName: '@TargetUser',
      withGrokTranslatedBio: true,
      variablesOverride: {
        screen_name: 'ignored-value',
        withGrokTranslatedBio: false
      },
      featuresOverride: {
        responsive_web_profile_redirect_enabled: true
      },
      fieldTogglesOverride: {
        withPayments: true
      }
    });

    expect(request.variables.screen_name).toBe('TargetUser');
    expect(request.variables.withGrokTranslatedBio).toBe(true);
    expect(request.features.responsive_web_profile_redirect_enabled).toBe(true);
    expect(request.features.hidden_profile_subscriptions_enabled).toBe(true);
    expect(request.fieldToggles.withPayments).toBe(true);
    expect(request.fieldToggles.withAuxiliaryUserLabels).toBe(true);
  });

  it('rejects empty screenName at runtime', () => {
    expect(() => {
      buildUserByScreenNameRequest({
        screenName: ' @ '
      });
    }).toThrowError('user-by-screenname requires a non-empty screenName');
  });
});
