import { createCallableApi } from '../../../src/sdk/callable-api';
import { buildUploadImageRequest } from './default';
import { getUploadImageDefaultParams, uploadImageMeta, UPLOAD_IMAGE_DESC_TEXT } from './desc';
import { fetchUploadImageResponse } from './fetch';
import { normalizeUploadImageResponse } from './normalize';
import type { UploadImageRequest, UploadImageResponse } from './types';

async function uploadImageImpl(input: UploadImageRequest): Promise<UploadImageResponse> {
  const resolved = buildUploadImageRequest(input);
  const payload = await fetchUploadImageResponse(resolved);
  return normalizeUploadImageResponse(payload);
}

/**
 * @summary Upload image binary via INIT/APPEND/FINALIZE and return media id for create-tweet.
 * @param input Upload request with required `file` Blob/File and optional upload overrides.
 * @returns Normalized upload result containing `mediaId` plus full payload in `__original`.
 * @example
 * const uploaded = await window.x.api.action.uploadImage({
 *   file,
 *   mediaType: 'image/jpeg'
 * });
 */
export const uploadImage = createCallableApi<UploadImageRequest, UploadImageResponse>(uploadImageImpl, {
  desc: UPLOAD_IMAGE_DESC_TEXT,
  getDefaultParams: getUploadImageDefaultParams,
  meta: uploadImageMeta
});

export * from './default';
export * from './fetch';
export * from './normalize';
export * from './types';
