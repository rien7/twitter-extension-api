import type {
  UploadImageApiError,
  UploadImageFinalizeImage,
  UploadImageOriginalResponse,
  UploadImageResponse
} from './types';

export function normalizeUploadImageResponse(payload: UploadImageOriginalResponse): UploadImageResponse {
  const mediaId =
    payload.finalize.media_id_string ??
    payload.init.media_id_string ??
    (payload.finalize.media_id !== undefined
      ? String(payload.finalize.media_id)
      : payload.init.media_id !== undefined
        ? String(payload.init.media_id)
        : undefined);
  const errors = collectUploadImageErrors(payload);
  const processingState = payload.finalize.processing_info?.state;
  const processingFailed = processingState === 'failed';

  return {
    success: Boolean(mediaId) && !processingFailed && errors.length === 0,
    mediaId,
    mediaKey: payload.finalize.media_key ?? payload.init.media_key,
    size: payload.finalize.size,
    expiresAfterSecs: payload.finalize.expires_after_secs ?? payload.init.expires_after_secs,
    image: toUploadImageSummary(payload.finalize.image),
    segmentCount: payload.append.length,
    processingState,
    checkAfterSecs: payload.finalize.processing_info?.check_after_secs,
    errors: errors.length ? errors : undefined,
    __original: payload
  };
}

function toUploadImageSummary(
  image?: UploadImageFinalizeImage
): UploadImageResponse['image'] | undefined {
  if (!image) {
    return undefined;
  }

  return {
    imageType: image.image_type,
    width: image.w,
    height: image.h
  };
}

function collectUploadImageErrors(payload: UploadImageOriginalResponse): UploadImageApiError[] {
  const errors: UploadImageApiError[] = [];

  if (payload.init.errors?.length) {
    errors.push(...payload.init.errors);
  }

  if (payload.finalize.errors?.length) {
    errors.push(...payload.finalize.errors);
  }

  const processingError = payload.finalize.processing_info?.error;
  if (processingError?.message) {
    errors.push({
      code: processingError.code,
      name: processingError.name,
      message: processingError.message
    });
  }

  return errors;
}
