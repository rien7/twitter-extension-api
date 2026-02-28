import type { XActionResponseBase } from '../../../src/shared/types';

/**
 * Public API input for upload-image action.
 */
export interface UploadImageRequest {
  /** Binary image data. Usually a File chosen by user. */
  file: Blob;
  /** Optional file name used in multipart field. Defaults to File.name or `blob`. */
  fileName?: string;
  /** MIME type used by INIT media_type. Defaults to file.type or image/jpeg. */
  mediaType?: string;
  /** Upload category used by INIT media_category. Defaults to tweet_image. */
  mediaCategory?: string;
  /** Chunk size for APPEND in bytes. Defaults to 5 MB. */
  chunkSize?: number;
  /** Optional MD5 hex used by FINALIZE original_md5. */
  originalMd5?: string;
  /** Override endpoint for experiments. Defaults to upload.x.com endpoint. */
  endpoint?: string;
  /** Optional custom headers merged into shared request headers. */
  headers?: Record<string, string>;
}

export interface UploadImageInitQuery {
  command: 'INIT';
  total_bytes: string;
  media_type: string;
  media_category: string;
}

export interface UploadImageAppendQuery {
  command: 'APPEND';
  media_id: string;
  segment_index: string;
}

export interface UploadImageFinalizeQuery {
  command: 'FINALIZE';
  media_id: string;
  original_md5?: string;
}

/**
 * Fully materialized request payload sent to upload endpoint.
 */
export interface UploadImageResolvedRequest {
  endpoint: string;
  headers?: Record<string, string>;
  file: Blob;
  fileName: string;
  chunkSize: number;
  appendFieldName: string;
  initQuery: UploadImageInitQuery;
  finalizeOriginalMd5?: string;
}

/**
 * REST error payload returned by upload endpoint.
 */
export interface UploadImageApiError {
  code?: number;
  name?: string;
  message: string;
}

/**
 * INIT response payload.
 */
export interface UploadImageInitResponse {
  media_id?: number;
  media_id_string?: string;
  media_key?: string;
  expires_after_secs?: number;
  errors?: UploadImageApiError[];
}

/**
 * APPEND request result for a single segment.
 */
export interface UploadImageAppendResponse {
  segmentIndex: number;
  status: number;
  responseText: string;
}

export interface UploadImageFinalizeImage {
  image_type?: string;
  w?: number;
  h?: number;
}

export interface UploadImageFinalizeProcessingError {
  code?: number;
  name?: string;
  message?: string;
}

export interface UploadImageFinalizeProcessingInfo {
  state?: string;
  check_after_secs?: number;
  progress_percent?: number;
  error?: UploadImageFinalizeProcessingError;
}

/**
 * FINALIZE response payload.
 */
export interface UploadImageFinalizeResponse {
  media_id?: number;
  media_id_string?: string;
  media_key?: string;
  size?: number;
  expires_after_secs?: number;
  image?: UploadImageFinalizeImage;
  processing_info?: UploadImageFinalizeProcessingInfo;
  errors?: UploadImageApiError[];
}

/**
 * Full payload composed from INIT + APPEND + FINALIZE steps.
 */
export interface UploadImageOriginalResponse {
  init: UploadImageInitResponse;
  append: UploadImageAppendResponse[];
  finalize: UploadImageFinalizeResponse;
}

/**
 * Normalized image summary.
 */
export interface UploadImageImageSummary {
  imageType?: string;
  width?: number;
  height?: number;
}

/**
 * Normalized SDK response for upload-image action.
 */
export interface UploadImageResponse
  extends XActionResponseBase<UploadImageOriginalResponse, UploadImageApiError> {
  /** Canonical media id from FINALIZE/INIT payload. */
  mediaId?: string;
  /** Canonical media key from FINALIZE/INIT payload. */
  mediaKey?: string;
  /** Media size in bytes returned by FINALIZE. */
  size?: number;
  /** Media expiry seconds returned by FINALIZE or INIT. */
  expiresAfterSecs?: number;
  /** Normalized image metadata when provided. */
  image?: UploadImageImageSummary;
  /** Number of APPEND segments uploaded. */
  segmentCount: number;
  /** FINALIZE processing state when provided. */
  processingState?: string;
  /** Retry hint in seconds when processing is pending. */
  checkAfterSecs?: number;
}
