import type { XTargetTweetActionResponseBase } from '../../../src/shared/types';

/**
 * Content type label used by Grok translation endpoint.
 */
export type GrokTranslationContentType = 'POST' | string;

/**
 * REST body fields sent to translation endpoint.
 */
export interface GrokTranslationRequestBody {
  /** Source content category expected by backend, typically `POST`. */
  content_type: GrokTranslationContentType;
  /** Target post id to translate. */
  id: string;
  /** Destination language code (for example `en`, `ja`, `zh`). */
  dst_lang: string;
}

/**
 * Public API input for grok-translation action.
 */
export interface GrokTranslationRequest {
  /** Target post id to translate. */
  tweetId: string;
  /** Destination language code. Defaults to `en`. */
  dstLang?: string;
  /** Source content category. Defaults to `POST`. */
  contentType?: GrokTranslationContentType;
  /** Override endpoint for experiments. Defaults to captured endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared request headers. */
  headers?: Record<string, string>;
  /** Partial body overrides merged with defaults. */
  bodyOverride?: Partial<GrokTranslationRequestBody>;
}

/**
 * Fully materialized request payload sent to server.
 */
export interface GrokTranslationResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  body: GrokTranslationRequestBody;
}

/**
 * REST error payload.
 */
export interface GrokTranslationApiError {
  code?: number;
  message: string;
}

export type GrokTranslationEntityValue =
  | string
  | number
  | boolean
  | null
  | GrokTranslationEntityObject
  | GrokTranslationEntityValue[];

export interface GrokTranslationEntityObject {
  [key: string]: GrokTranslationEntityValue;
}

/**
 * Translation result payload returned in `result`.
 */
export interface GrokTranslationResult {
  content_type?: string;
  text?: string;
  entities?: GrokTranslationEntityObject;
}

/**
 * Full server payload as returned by grok/translation endpoint.
 */
export interface GrokTranslationOriginalResponse {
  result?: GrokTranslationResult;
  errors?: GrokTranslationApiError[];
  error?: string;
}

/**
 * Normalized SDK response for day-to-day usage.
 */
export interface GrokTranslationResponse
  extends XTargetTweetActionResponseBase<GrokTranslationOriginalResponse, GrokTranslationApiError> {
  targetTweetId: string;
  dstLang: string;
  contentType: string;
  translatedText?: string;
  entities: GrokTranslationEntityObject;
  errorMessage?: string;
}
