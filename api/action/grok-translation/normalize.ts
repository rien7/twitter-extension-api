import type {
  GrokTranslationOriginalResponse,
  GrokTranslationResolvedRequest,
  GrokTranslationResponse
} from './types';

export function normalizeGrokTranslationResponse(
  payload: GrokTranslationOriginalResponse,
  request: GrokTranslationResolvedRequest
): GrokTranslationResponse {
  const translatedText = payload.result?.text;
  const hasError = Boolean(payload.error) || Boolean(payload.errors?.length);

  return {
    success: Boolean(translatedText) && !hasError,
    tweetId: request.body.id,
    dstLang: request.body.dst_lang,
    contentType: payload.result?.content_type ?? request.body.content_type,
    translatedText,
    entities: payload.result?.entities ?? {},
    errorMessage: payload.errors?.[0]?.message ?? payload.error,
    errors: payload.errors,
    __original: payload
  };
}
