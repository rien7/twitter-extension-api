import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildDeleteTweetRequest } from './default';
import type {
  DeleteTweetOriginalResponse,
  DeleteTweetRequest,
  DeleteTweetResponse
} from './types';

const DELETE_TWEET_DOC = `# delete-tweet

Delete a tweet via Twitter/X GraphQL.

Request type: DeleteTweetRequest
Response type: DeleteTweetResponse

Input strategy:
- Required: tweetId
- Defaults are stored in default.ts.
- Protocol-level customization is available via variablesOverride and request metadata overrides.

Normalized response fields:
- success: mutation branch + error state summary
- tweetId: requested tweet id
- deletedTweetId: server-confirmed id when present
- __original: full GraphQL payload`;

const deleteTweetDesc: XApiDesc = {
  id: 'delete-tweet',
  title: 'Delete Tweet',
  doc: DELETE_TWEET_DOC,
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/DeleteTweet',
    operationName: 'DeleteTweet'
  },
  requestTypeName: 'DeleteTweetRequest',
  responseTypeName: 'DeleteTweetResponse'
};

async function deleteTweetImpl(input: DeleteTweetRequest): Promise<DeleteTweetResponse> {
  const resolved = buildDeleteTweetRequest(input);

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
  let payload: DeleteTweetOriginalResponse;

  try {
    payload = JSON.parse(responseText) as DeleteTweetOriginalResponse;
  } catch {
    throw new Error(
      `delete-tweet returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`delete-tweet failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`delete-tweet failed with status ${response.status}`);
  }

  return normalizeDeleteTweetResponse(payload, resolved.variables.tweet_id);
}

function normalizeDeleteTweetResponse(
  payload: DeleteTweetOriginalResponse,
  requestedTweetId: string
): DeleteTweetResponse {
  const deletedTweetId = payload.data?.delete_tweet?.tweet_results?.result?.rest_id;
  const success = Boolean(payload.data?.delete_tweet) && !payload.errors?.length;

  return {
    success,
    tweetId: requestedTweetId,
    deletedTweetId,
    errors: payload.errors,
    __original: payload
  };
}

export const deleteTweet = Object.assign(deleteTweetImpl, {
  __desc: deleteTweetDesc
}) as XCallableApi<DeleteTweetRequest, DeleteTweetResponse>;

export * from './default';
export * from './types';
