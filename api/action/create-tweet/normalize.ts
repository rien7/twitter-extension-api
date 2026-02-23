import type {
  CreateTweetLegacy,
  CreateTweetMode,
  CreateTweetOriginalResponse,
  CreateTweetResponse,
  CreateTweetResult,
  CreateTweetTweetResult,
  CreateTweetTweetWithVisibilityResult
} from './types';

export function normalizeCreateTweetResponse(
  payload: CreateTweetOriginalResponse,
  requestedMode: CreateTweetMode
): CreateTweetResponse {
  const rawResult = payload.data?.create_tweet?.tweet_results?.result;
  const result = unwrapCreateTweetResult(rawResult);
  const legacy = result?.legacy;
  const mode = detectCreateTweetMode(legacy) ?? requestedMode;
  const tweetId = result?.rest_id ?? legacy?.id_str;

  return {
    success: Boolean(result) && !payload.errors?.length,
    requestedMode,
    mode,
    tweetId,
    text: legacy?.full_text,
    authorUserId: legacy?.user_id_str ?? result?.core?.user_results?.result?.rest_id,
    conversationId: legacy?.conversation_id_str,
    inReplyToTweetId: legacy?.in_reply_to_status_id_str ?? undefined,
    inReplyToUserId: legacy?.in_reply_to_user_id_str ?? undefined,
    inReplyToScreenName: legacy?.in_reply_to_screen_name ?? undefined,
    quotedTweetId: legacy?.quoted_status_id_str ?? undefined,
    errors: payload.errors,
    __original: payload
  };
}

function unwrapCreateTweetResult(result?: CreateTweetResult): CreateTweetTweetResult | undefined {
  if (!result) {
    return undefined;
  }

  if (isTweetWithVisibilityResult(result) && result.tweet) {
    return result.tweet;
  }

  return result as CreateTweetTweetResult;
}

function isTweetWithVisibilityResult(
  result: CreateTweetResult
): result is CreateTweetTweetWithVisibilityResult {
  return 'tweet' in result;
}

function detectCreateTweetMode(legacy?: CreateTweetLegacy): CreateTweetMode | undefined {
  if (!legacy) {
    return undefined;
  }

  if (legacy.in_reply_to_status_id_str) {
    return 'reply';
  }

  if (legacy.is_quote_status || legacy.quoted_status_id_str) {
    return 'quote';
  }

  return 'direct';
}
