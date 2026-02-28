import type { XApiMeta } from '../../../src/shared/types';
import { resolveDefaultParamsWithSelfUserId } from '../../../src/sdk/default-params';
import {
  DEFAULT_UPLOAD_IMAGE_APPEND_FIELD_NAME,
  DEFAULT_UPLOAD_IMAGE_CHUNK_SIZE,
  DEFAULT_UPLOAD_IMAGE_ENDPOINT,
  DEFAULT_UPLOAD_IMAGE_MEDIA_CATEGORY,
  DEFAULT_UPLOAD_IMAGE_MEDIA_TYPE
} from './default';

export const UPLOAD_IMAGE_DESC_TEXT = [
  '[upload-image]',
  'Purpose: Upload an image to X media endpoint and return media id for tweeting.',
  'Call: window.x.api.action.uploadImage(input)',
  'Input:',
  '  Required:',
  '    - file (Blob/File)',
  '  Optional:',
  '    - fileName',
  '    - mediaType',
  '    - mediaCategory',
  '    - chunkSize',
  '    - originalMd5',
  '    - endpoint',
  '    - headers',
  'Returns: success, mediaId, mediaKey, image, segmentCount, errors'
].join('\n');

const UPLOAD_IMAGE_DEFAULT_PARAMS_TEMPLATE = Object.freeze({
  endpoint: DEFAULT_UPLOAD_IMAGE_ENDPOINT,
  init: {
    command: 'INIT',
    media_type: DEFAULT_UPLOAD_IMAGE_MEDIA_TYPE,
    media_category: DEFAULT_UPLOAD_IMAGE_MEDIA_CATEGORY,
    total_bytes: '<from file.size>'
  },
  append: {
    command: 'APPEND',
    field: DEFAULT_UPLOAD_IMAGE_APPEND_FIELD_NAME,
    chunkSize: DEFAULT_UPLOAD_IMAGE_CHUNK_SIZE
  },
  finalize: {
    command: 'FINALIZE',
    original_md5: '<optional>'
  }
});

export function getUploadImageDefaultParams() {
  return resolveDefaultParamsWithSelfUserId(UPLOAD_IMAGE_DEFAULT_PARAMS_TEMPLATE);
}

export const uploadImageMeta: XApiMeta = {
  id: 'upload-image',
  title: 'Upload Image',
  match: {
    method: 'POST',
    path: '/i/media/upload.json'
  },
  requestTypeName: 'UploadImageRequest',
  responseTypeName: 'UploadImageResponse'
};
