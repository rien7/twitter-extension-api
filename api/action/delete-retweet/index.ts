import type { XApiDesc, XCallableApi } from '../../../src/shared/types';
import { buildGraphqlHeaders } from '../../../src/sdk/request-headers';
import { buildDeleteRetweetRequest } from './default';
import type {
  DeleteRetweetOriginalResponse,
  DeleteRetweetRequest,
  DeleteRetweetResponse
} from './types';

const DELETE_RETWEET_DOC = `# delete-retweet

Undo a retweet via Twitter/X GraphQL.

Request type: DeleteRetweetRequest
Response type: DeleteRetweetResponse

Input strategy:
- Required: tweetId
- Defaults are stored in default.ts.
- Protocol-level customization is available via variablesOverride and request metadata overrides.

Normalized response fields:
- success: mutation branch + error state summary
- sourceTweetId: requested source tweet id
- unretweetedTweetId: server-confirmed id when present
- __original: full GraphQL payload`;

const deleteRetweetDesc: XApiDesc = {
  id: 'delete-retweet',
  title: 'Delete Retweet',
  doc: DELETE_RETWEET_DOC,
  match: {
    method: 'POST',
    path: '/i/api/graphql/*/DeleteRetweet',
    operationName: 'DeleteRetweet'
  },
  requestTypeName: 'DeleteRetweetRequest',
  responseTypeName: 'DeleteRetweetResponse'
};

async function deleteRetweetImpl(input: DeleteRetweetRequest): Promise<DeleteRetweetResponse> {
  const resolved = buildDeleteRetweetRequest(input);

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
  let payload: DeleteRetweetOriginalResponse;

  try {
    payload = JSON.parse(responseText) as DeleteRetweetOriginalResponse;
  } catch {
    throw new Error(
      `delete-retweet returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const graphQLError = payload.errors?.[0]?.message;
    if (graphQLError) {
      throw new Error(`delete-retweet failed (${response.status}): ${graphQLError}`);
    }
    throw new Error(`delete-retweet failed with status ${response.status}`);
  }

  return normalizeDeleteRetweetResponse(payload, resolved.variables.source_tweet_id);
}

function normalizeDeleteRetweetResponse(
  payload: DeleteRetweetOriginalResponse,
  requestedSourceTweetId: string
): DeleteRetweetResponse {
  const unretweetedTweetId = payload.data?.unretweet?.source_tweet_results?.result?.rest_id;
  const success = Boolean(payload.data?.unretweet) && !payload.errors?.length;

  return {
    success,
    sourceTweetId: requestedSourceTweetId,
    unretweetedTweetId,
    errors: payload.errors,
    __original: payload
  };
}

export const deleteRetweet = Object.assign(deleteRetweetImpl, {
  __desc: deleteRetweetDesc
}) as XCallableApi<DeleteRetweetRequest, DeleteRetweetResponse>;

export * from './default';
export * from './types';
