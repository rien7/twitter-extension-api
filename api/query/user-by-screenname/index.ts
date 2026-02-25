import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildUserByScreenNameRequest } from './default';
import {
  getUserByScreenNameDefaultParams,
  USER_BY_SCREEN_NAME_DESC_TEXT,
  userByScreenNameMeta
} from './desc';
import { fetchUserByScreenNameResponse } from './fetch';
import { normalizeUserByScreenNameResponse } from './normalize';
import type {
  UserByScreenNameRequest,
  UserByScreenNameResponse
} from './types';

async function userByScreenNameImpl(
  input: UserByScreenNameRequest
): Promise<UserByScreenNameResponse> {
  const resolved = buildUserByScreenNameRequest(input);
  const payload = await fetchUserByScreenNameResponse(resolved);
  return normalizeUserByScreenNameResponse(payload);
}

/**
 * @summary Fetch one user profile by screen name.
 * @param input Request input containing required `screenName`.
 * @returns Normalized user profile fields with full payload in `__original`.
 * @example
 * const profile = await window.x.api.query.userByScreenName({ screenName: 'Twitter' });
 */
export const userByScreenName = createCallableApi<
  UserByScreenNameRequest,
  UserByScreenNameResponse
>(userByScreenNameImpl, {
  desc: USER_BY_SCREEN_NAME_DESC_TEXT,
  getDefaultParams: getUserByScreenNameDefaultParams,
  meta: userByScreenNameMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
