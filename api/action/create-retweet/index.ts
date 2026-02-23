import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildCreateRetweetRequest } from './default';
import {
  createRetweetMeta,
  CREATE_RETWEET_DESC_TEXT,
  getCreateRetweetDefaultParams
} from './desc';
import { fetchCreateRetweetResponse } from './fetch';
import { normalizeCreateRetweetResponse } from './normalize';
import type { CreateRetweetRequest, CreateRetweetResponse } from './types';

async function createRetweetImpl(input: CreateRetweetRequest): Promise<CreateRetweetResponse> {
  const resolved = buildCreateRetweetRequest(input);
  const payload = await fetchCreateRetweetResponse(resolved);
  return normalizeCreateRetweetResponse(payload, resolved.variables.tweet_id);
}

/**
 * @summary Retweet a source tweet via GraphQL CreateRetweet mutation.
 * @param input Create-retweet request with required `tweetId`.
 * @returns Normalized retweet result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.createRetweet({ tweetId: '42' });
 */
export const createRetweet = createCallableApi<CreateRetweetRequest, CreateRetweetResponse>(
  createRetweetImpl,
  {
    desc: CREATE_RETWEET_DESC_TEXT,
    getDefaultParams: getCreateRetweetDefaultParams,
    meta: createRetweetMeta
  }
);

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
