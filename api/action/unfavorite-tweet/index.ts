import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildUnfavoriteTweetRequest } from './default';
import type {
  UnfavoriteTweetOriginalResponse,
  UnfavoriteTweetRequest,
  UnfavoriteTweetResponse
} from './types';

const UNFAVORITE_TWEET_DOC = `# unfavorite-tweet

Unlike a tweet via Twitter/X GraphQL.

Request type: UnfavoriteTweetRequest
Response type: UnfavoriteTweetResponse

Input strategy:
- Required: tweetId
- Defaults are stored in default.ts.
- Protocol-level customization is available via variablesOverride and request metadata overrides.

Normalized response fields:
- success: mutation branch + error state summary
- tweetId: requested tweet id
- message: server unfavorite result string
- __original: full GraphQL payload`;

const unfavoriteTweetDesc: XApiDesc = {
  id: 'unfavorite-tweet',
  title: 'Unfavorite Tweet',
  doc: UNFAVORITE_TWEET_DOC,
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/UnfavoriteTweet',
    operationName: 'UnfavoriteTweet'
  },
  requestTypeName: 'UnfavoriteTweetRequest',
  responseTypeName: 'UnfavoriteTweetResponse'
};

async function unfavoriteTweetImpl(input: UnfavoriteTweetRequest): Promise<UnfavoriteTweetResponse> {
  const resolved = buildUnfavoriteTweetRequest(input);

  const response = await fetch(resolved.endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: buildGraphqlHeaders(resolved.headers),
    body: JSON.stringify({
      operationName: resolved.operationName,
      queryId: resolved.queryId,
      variables: resolved.variables
    })
  });

  const responseText = await response.text();
  let payload: UnfavoriteTweetOriginalResponse;

  try {
    payload = JSON.parse(responseText) as UnfavoriteTweetOriginalResponse;
  } catch {
    throw new Error(
      `unfavorite-tweet returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`unfavorite-tweet failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`unfavorite-tweet failed with status ${response.status}`);
  }

  return normalizeUnfavoriteTweetResponse(payload, resolved.variables.tweet_id);
}

function normalizeUnfavoriteTweetResponse(
  payload: UnfavoriteTweetOriginalResponse,
  requestedTweetId: string
): UnfavoriteTweetResponse {
  const message = payload.data?.unfavorite_tweet;
  const success = Boolean(message) && !payload.errors?.length;

  return {
    success,
    tweetId: requestedTweetId,
    message,
    errors: payload.errors,
    __original: payload
  };
}

export const unfavoriteTweet = Object.assign(unfavoriteTweetImpl, {
  __desc: unfavoriteTweetDesc
}) as XCallableApi<UnfavoriteTweetRequest, UnfavoriteTweetResponse>;

export * from './default';
export * from './types';
