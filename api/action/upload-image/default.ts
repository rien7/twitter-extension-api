import type { UploadImageRequest, UploadImageResolvedRequest } from './types';

export const DEFAULT_UPLOAD_IMAGE_ENDPOINT = 'https://upload.x.com/i/media/upload.json';
export const DEFAULT_UPLOAD_IMAGE_MEDIA_TYPE = 'image/jpeg';
export const DEFAULT_UPLOAD_IMAGE_MEDIA_CATEGORY = 'tweet_image';
export const DEFAULT_UPLOAD_IMAGE_CHUNK_SIZE = 5 * 1024 * 1024;
export const DEFAULT_UPLOAD_IMAGE_APPEND_FIELD_NAME = 'media';

export function buildUploadImageRequest(input: UploadImageRequest): UploadImageResolvedRequest {
  if (!input.file) {
    throw new Error('upload-image requires a file Blob');
  }

  if (input.file.size <= 0) {
    throw new Error('upload-image requires a non-empty file');
  }

  const mediaType = resolveMediaType(input);
  const mediaCategory = resolveMediaCategory(input);
  const chunkSize = resolveChunkSize(input.chunkSize);
  const fileName = resolveFileName(input);

  return {
    endpoint: input.endpoint ?? DEFAULT_UPLOAD_IMAGE_ENDPOINT,
    headers: input.headers,
    file: input.file,
    fileName,
    chunkSize,
    appendFieldName: DEFAULT_UPLOAD_IMAGE_APPEND_FIELD_NAME,
    initQuery: {
      command: 'INIT',
      total_bytes: String(input.file.size),
      media_type: mediaType,
      media_category: mediaCategory
    },
    finalizeOriginalMd5: normalizeOptionalString(input.originalMd5)
  };
}

function resolveMediaType(input: UploadImageRequest): string {
  return (
    normalizeOptionalString(input.mediaType) ??
    normalizeOptionalString(input.file.type) ??
    DEFAULT_UPLOAD_IMAGE_MEDIA_TYPE
  );
}

function resolveMediaCategory(input: UploadImageRequest): string {
  return normalizeOptionalString(input.mediaCategory) ?? DEFAULT_UPLOAD_IMAGE_MEDIA_CATEGORY;
}

function resolveChunkSize(chunkSize?: number): number {
  if (chunkSize === undefined) {
    return DEFAULT_UPLOAD_IMAGE_CHUNK_SIZE;
  }

  if (!Number.isFinite(chunkSize) || chunkSize <= 0 || !Number.isInteger(chunkSize)) {
    throw new Error('upload-image chunkSize must be a positive integer');
  }

  return chunkSize;
}

function resolveFileName(input: UploadImageRequest): string {
  const fromInput = normalizeOptionalString(input.fileName);
  if (fromInput) {
    return fromInput;
  }

  const maybeFile = input.file as Blob & { name?: unknown };
  if (typeof maybeFile.name === 'string') {
    const fromFile = normalizeOptionalString(maybeFile.name);
    if (fromFile) {
      return fromFile;
    }
  }

  return 'blob';
}

function normalizeOptionalString(value?: string): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}
