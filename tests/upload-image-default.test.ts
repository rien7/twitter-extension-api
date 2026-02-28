import { describe, expect, it } from 'vitest';

import {
  buildUploadImageRequest,
  DEFAULT_UPLOAD_IMAGE_APPEND_FIELD_NAME,
  DEFAULT_UPLOAD_IMAGE_CHUNK_SIZE,
  DEFAULT_UPLOAD_IMAGE_ENDPOINT,
  DEFAULT_UPLOAD_IMAGE_MEDIA_CATEGORY
} from '../api/action/upload-image/default';

describe('uploadImage defaults', () => {
  it('builds request defaults from file input', () => {
    const file = new Blob(['image-data'], { type: 'image/png' });

    const request = buildUploadImageRequest({ file });

    expect(request.endpoint).toBe(DEFAULT_UPLOAD_IMAGE_ENDPOINT);
    expect(request.file).toBe(file);
    expect(request.fileName).toBe('blob');
    expect(request.chunkSize).toBe(DEFAULT_UPLOAD_IMAGE_CHUNK_SIZE);
    expect(request.appendFieldName).toBe(DEFAULT_UPLOAD_IMAGE_APPEND_FIELD_NAME);
    expect(request.initQuery).toEqual({
      command: 'INIT',
      total_bytes: String(file.size),
      media_type: 'image/png',
      media_category: DEFAULT_UPLOAD_IMAGE_MEDIA_CATEGORY
    });
  });

  it('allows overrides for protocol and upload metadata', () => {
    const file = new Blob(['image-data'], { type: 'image/jpeg' });

    const request = buildUploadImageRequest({
      file,
      endpoint: '/custom/upload.json',
      fileName: 'photo.jpg',
      mediaType: 'image/webp',
      mediaCategory: 'tweet_image',
      chunkSize: 1024,
      originalMd5: '00000000000000000000000000000000'
    });

    expect(request.endpoint).toBe('/custom/upload.json');
    expect(request.fileName).toBe('photo.jpg');
    expect(request.chunkSize).toBe(1024);
    expect(request.initQuery.media_type).toBe('image/webp');
    expect(request.initQuery.media_category).toBe('tweet_image');
    expect(request.finalizeOriginalMd5).toBe('00000000000000000000000000000000');
  });

  it('rejects missing file, empty file, or invalid chunkSize', () => {
    expect(() => {
      buildUploadImageRequest({
        file: new Blob([])
      });
    }).toThrowError('upload-image requires a non-empty file');

    expect(() => {
      buildUploadImageRequest({
        file: new Blob(['abc']),
        chunkSize: 0
      });
    }).toThrowError('upload-image chunkSize must be a positive integer');
  });
});
