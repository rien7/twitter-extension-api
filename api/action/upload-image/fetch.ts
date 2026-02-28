import { buildGraphqlHeadersForRequest } from '../../../src/sdk/request-headers';
import type {
  UploadImageApiError,
  UploadImageAppendQuery,
  UploadImageAppendResponse,
  UploadImageFinalizeQuery,
  UploadImageFinalizeResponse,
  UploadImageInitQuery,
  UploadImageInitResponse,
  UploadImageOriginalResponse,
  UploadImageResolvedRequest
} from './types';

export async function fetchUploadImageResponse(
  request: UploadImageResolvedRequest
): Promise<UploadImageOriginalResponse> {
  const initUrl = buildUploadRequestUrl(request.endpoint, request.initQuery);
  const initResponse = await fetch(initUrl, {
    method: 'POST',
    credentials: 'include',
    headers: await buildUploadHeaders(initUrl, request.headers, { omitContentType: true })
  });
  const initPayload = await parseJsonResponse<UploadImageInitResponse>(
    initResponse,
    'upload-image INIT'
  );

  if (!initResponse.ok) {
    const apiErrorMessage = pickApiErrorMessage(initPayload.errors);
    if (apiErrorMessage) {
      throw new Error(`upload-image INIT failed (${initResponse.status}): ${apiErrorMessage}`);
    }
    throw new Error(`upload-image INIT failed with status ${initResponse.status}`);
  }

  const mediaId = resolveMediaId(initPayload);
  if (!mediaId) {
    throw new Error('upload-image INIT response missing media_id_string');
  }

  const appendResponses: UploadImageAppendResponse[] = [];
  const chunks = splitBlobIntoChunks(request.file, request.chunkSize);

  for (let segmentIndex = 0; segmentIndex < chunks.length; segmentIndex += 1) {
    const appendQuery: UploadImageAppendQuery = {
      command: 'APPEND',
      media_id: mediaId,
      segment_index: String(segmentIndex)
    };
    const appendUrl = buildUploadRequestUrl(request.endpoint, appendQuery);
    const formData = new FormData();
    formData.set(request.appendFieldName, chunks[segmentIndex], request.fileName);

    const appendResponse = await fetch(appendUrl, {
      method: 'POST',
      credentials: 'include',
      headers: await buildUploadHeaders(appendUrl, request.headers, { omitContentType: true }),
      body: formData
    });
    const appendResponseText = await appendResponse.text();

    if (!appendResponse.ok) {
      throw new Error(
        `upload-image APPEND failed (${appendResponse.status}, segment=${segmentIndex}): ${appendResponseText.slice(0, 320)}`
      );
    }

    appendResponses.push({
      segmentIndex,
      status: appendResponse.status,
      responseText: appendResponseText
    });
  }

  const finalizeQuery: UploadImageFinalizeQuery = {
    command: 'FINALIZE',
    media_id: mediaId
  };
  if (request.finalizeOriginalMd5) {
    finalizeQuery.original_md5 = request.finalizeOriginalMd5;
  }

  const finalizeUrl = buildUploadRequestUrl(request.endpoint, finalizeQuery);
  const finalizeResponse = await fetch(finalizeUrl, {
    method: 'POST',
    credentials: 'include',
    headers: await buildUploadHeaders(finalizeUrl, request.headers, { omitContentType: true })
  });
  const finalizePayload = await parseJsonResponse<UploadImageFinalizeResponse>(
    finalizeResponse,
    'upload-image FINALIZE'
  );

  if (!finalizeResponse.ok) {
    const apiErrorMessage = pickApiErrorMessage(finalizePayload.errors);
    if (apiErrorMessage) {
      throw new Error(`upload-image FINALIZE failed (${finalizeResponse.status}): ${apiErrorMessage}`);
    }
    throw new Error(`upload-image FINALIZE failed with status ${finalizeResponse.status}`);
  }

  return {
    init: initPayload,
    append: appendResponses,
    finalize: finalizePayload
  };
}

interface BuildUploadHeadersOptions {
  omitContentType?: boolean;
}

async function buildUploadHeaders(
  endpoint: string,
  baseHeaders?: Record<string, string>,
  options?: BuildUploadHeadersOptions
): Promise<Record<string, string>> {
  const headers = await buildGraphqlHeadersForRequest({
    method: 'POST',
    endpoint,
    headers: {
      ...baseHeaders,
      accept: '*/*'
    }
  });

  if (options?.omitContentType) {
    delete headers['content-type'];
  }

  return headers;
}

function buildUploadRequestUrl(
  endpoint: string,
  query: UploadImageInitQuery | UploadImageAppendQuery | UploadImageFinalizeQuery
): string {
  const parsed = resolveUrl(endpoint);
  parsed.search = '';

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      parsed.searchParams.set(key, value);
    }
  }

  return parsed.toString();
}

function resolveUrl(endpoint: string): URL {
  try {
    return new URL(endpoint, getDefaultOrigin());
  } catch {
    throw new Error(`upload-image received invalid endpoint: ${endpoint}`);
  }
}

function getDefaultOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'https://x.com';
}

async function parseJsonResponse<T>(response: Response, label: string): Promise<T> {
  const responseText = await response.text();

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error(`${label} returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`);
  }
}

function resolveMediaId(payload: UploadImageInitResponse): string | undefined {
  return payload.media_id_string ?? (payload.media_id !== undefined ? String(payload.media_id) : undefined);
}

function pickApiErrorMessage(errors?: UploadImageApiError[]): string | undefined {
  if (!errors?.length) {
    return undefined;
  }

  for (const error of errors) {
    if (error.message) {
      return error.message;
    }
  }

  return undefined;
}

function splitBlobIntoChunks(file: Blob, chunkSize: number): Blob[] {
  const chunks: Blob[] = [];

  for (let offset = 0; offset < file.size; offset += chunkSize) {
    chunks.push(file.slice(offset, offset + chunkSize));
  }

  return chunks;
}
