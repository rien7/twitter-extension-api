import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildDeleteRetweetRequest } from './default';
import {
  DELETE_RETWEET_DESC_TEXT,
  deleteRetweetMeta,
  getDeleteRetweetDefaultParams
} from './desc';
import { fetchDeleteRetweetResponse } from './fetch';
import { normalizeDeleteRetweetResponse } from './normalize';
import type {
  DeleteRetweetRequest,
  DeleteRetweetResponse
} from './types';

async function deleteRetweetImpl(input: DeleteRetweetRequest): Promise<DeleteRetweetResponse> {
  const resolved = buildDeleteRetweetRequest(input);
  const payload = await fetchDeleteRetweetResponse(resolved);
  return normalizeDeleteRetweetResponse(payload, resolved.variables.source_tweet_id);
}

/**
 * @summary Undo a retweet via GraphQL DeleteRetweet mutation.
 * @param input Delete-retweet request with required `tweetId`.
 * @returns Normalized unretweet result and full payload in `__original`.
 * @example
 * const result = await window.x.api.action.deleteRetweet({ tweetId: '42' });
 */
export const deleteRetweet = createCallableApi<DeleteRetweetRequest, DeleteRetweetResponse>(
  deleteRetweetImpl,
  {
    desc: DELETE_RETWEET_DESC_TEXT,
    getDefaultParams: getDeleteRetweetDefaultParams,
    meta: deleteRetweetMeta
  }
);

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
