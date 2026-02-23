import { buildGraphqlHeadersForRequest } from '../../../src/sdk/request-headers';
import type {
  GrokTranslationOriginalResponse,
  GrokTranslationResolvedRequest
} from './types';

export async function fetchGrokTranslationResponse(
  request: GrokTranslationResolvedRequest
): Promise<GrokTranslationOriginalResponse> {
  const response = await fetch(request.endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: await buildGraphqlHeadersForRequest({
      method: 'POST',
      endpoint: request.endpoint,
      headers: {
        ...request.headers,
        accept: 'application/json, text/plain, */*',
        'content-type': 'text/plain;charset=UTF-8'
      }
    }),
    body: JSON.stringify(request.body)
  });

  const responseText = await response.text();
  const payload = parseGrokTranslationPayload(responseText);

  if (!payload) {
    throw new Error(
      `grok-translation returned non-JSON response (${response.status}): ${responseText.slice(0, 320)}`
    );
  }

  if (!response.ok) {
    const apiErrorMessage = payload.errors?.[0]?.message ?? payload.error;
    if (apiErrorMessage) {
      throw new Error(`grok-translation failed (${response.status}): ${apiErrorMessage}`);
    }
    throw new Error(`grok-translation failed with status ${response.status}`);
  }

  return payload;
}

function parseGrokTranslationPayload(responseText: string): GrokTranslationOriginalResponse | undefined {
  const directPayload = parseJsonObject(responseText);
  if (directPayload) {
    return directPayload;
  }

  const streamedPayload = parseStreamedPayload(responseText);
  if (streamedPayload) {
    return streamedPayload;
  }

  const base64Payload = parseBase64DataUrl(responseText);
  if (!base64Payload) {
    return undefined;
  }

  const decodedPayloadText = decodeBase64ToUtf8(base64Payload);
  if (!decodedPayloadText) {
    return undefined;
  }

  const decodedDirectPayload = parseJsonObject(decodedPayloadText);
  if (decodedDirectPayload) {
    return decodedDirectPayload;
  }

  return parseStreamedPayload(decodedPayloadText);
}

function parseJsonObject(text: string): GrokTranslationOriginalResponse | undefined {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return undefined;
    }

    return parsed as GrokTranslationOriginalResponse;
  } catch {
    return undefined;
  }
}

function parseBase64DataUrl(text: string): string | undefined {
  const matched = text
    .trim()
    .match(/^data:[^;,]+;base64,([A-Za-z0-9+/=\s]+)$/i);

  if (!matched?.[1]) {
    return undefined;
  }

  return matched[1].replace(/\s+/g, '');
}

function decodeBase64ToUtf8(base64Payload: string): string | undefined {
  try {
    if (typeof atob === 'function') {
      const binary = atob(base64Payload);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }

    if (typeof Buffer !== 'undefined') {
      return Buffer.from(base64Payload, 'base64').toString('utf8');
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function parseStreamedPayload(responseText: string): GrokTranslationOriginalResponse | undefined {
  const jsonObjectTexts = extractJsonObjectTexts(responseText);
  if (!jsonObjectTexts.length) {
    return undefined;
  }

  const parsedObjects = jsonObjectTexts
    .map((candidate) => parseJsonObject(candidate))
    .filter((payload): payload is GrokTranslationOriginalResponse => Boolean(payload));

  if (!parsedObjects.length) {
    return undefined;
  }

  return mergeStreamedPayloads(parsedObjects);
}

function extractJsonObjectTexts(responseText: string): string[] {
  const objects: string[] = [];

  let depth = 0;
  let startIndex = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < responseText.length; index += 1) {
    const char = responseText[index];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      if (depth === 0) {
        startIndex = index;
      }
      depth += 1;
      continue;
    }

    if (char === '}' && depth > 0) {
      depth -= 1;
      if (depth === 0 && startIndex >= 0) {
        objects.push(responseText.slice(startIndex, index + 1));
        startIndex = -1;
      }
    }
  }

  if (depth > 0 && startIndex >= 0 && !inString) {
    const repairedTail = `${responseText.slice(startIndex)}${'}'.repeat(depth)}`;
    objects.push(repairedTail);
  }

  return objects;
}

function mergeStreamedPayloads(
  payloads: GrokTranslationOriginalResponse[]
): GrokTranslationOriginalResponse {
  const latestPayload = payloads[payloads.length - 1] ?? {};
  const textChunks = payloads
    .map((payload) => payload.result?.text)
    .filter((text): text is string => typeof text === 'string' && text.length > 0);

  const mergedText = mergeStreamedTextChunks(textChunks);
  const mergedContentType = pickLastDefined(payloads.map((payload) => payload.result?.content_type));
  const mergedEntities = pickLastDefined(payloads.map((payload) => payload.result?.entities));
  const mergedError = pickLastDefined(payloads.map((payload) => payload.error));
  const mergedErrors = payloads.flatMap((payload) => payload.errors ?? []);

  const merged: GrokTranslationOriginalResponse = {
    ...latestPayload
  };

  if (mergedContentType !== undefined || mergedText !== undefined || mergedEntities !== undefined) {
    merged.result = {
      ...(latestPayload.result ?? {}),
      ...(mergedContentType !== undefined ? { content_type: mergedContentType } : {}),
      ...(mergedText !== undefined ? { text: mergedText } : {}),
      ...(mergedEntities !== undefined ? { entities: mergedEntities } : {})
    };
  }

  if (mergedError !== undefined) {
    merged.error = mergedError;
  }

  if (mergedErrors.length > 0) {
    merged.errors = mergedErrors;
  }

  return merged;
}

function mergeStreamedTextChunks(chunks: string[]): string | undefined {
  if (!chunks.length) {
    return undefined;
  }

  const isMonotonicGrowth = chunks.every((chunk, index) => {
    if (index === 0) {
      return true;
    }

    return chunk.startsWith(chunks[index - 1]);
  });

  if (isMonotonicGrowth) {
    return chunks[chunks.length - 1];
  }

  const dedupedChunks: string[] = [];
  for (const chunk of chunks) {
    if (dedupedChunks[dedupedChunks.length - 1] === chunk) {
      continue;
    }
    dedupedChunks.push(chunk);
  }

  return dedupedChunks.join('');
}

function pickLastDefined<T>(values: Array<T | undefined>): T | undefined {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}
