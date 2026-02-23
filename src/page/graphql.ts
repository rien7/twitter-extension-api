import type { XGraphqlMeta, XShapeNode } from '../shared/types';
import {
  hashShape,
  inferShape,
  normalizeMethod,
  normalizePath,
  redactSensitiveData,
  safeJsonParse
} from '../shared/shape';

const TWITTER_GQL_PATH_SEGMENT = '/i/api/graphql/';
const TWEET_ID_FINGERPRINT_PLACEHOLDER = '42';

export function isTwitterGraphqlPath(path: string): boolean {
  return normalizePath(path).includes(TWITTER_GQL_PATH_SEGMENT);
}

export function extractOperationNameFromPath(path: string): string | undefined {
  const normalizedPath = normalizePath(path);
  const segments = normalizedPath.split('/').filter(Boolean);
  const graphqlIndex = segments.findIndex((segment) => segment === 'graphql');

  if (graphqlIndex === -1) {
    return undefined;
  }

  const operationName = segments[graphqlIndex + 2];
  return operationName || undefined;
}

export function detectGraphqlMeta(input: {
  method?: string;
  path: string;
  url: string;
  requestPayload?: unknown;
}): XGraphqlMeta {
  const method = normalizeMethod(input.method);
  if (method !== 'POST' && method !== 'GET') {
    return { isGraphql: false };
  }

  const byPath = isTwitterGraphqlPath(input.path);
  const parsedFromPayload = parsePayloadAsGraphql(input.requestPayload);
  const parsedFromUrl = parseGraphqlFromUrl(input.url);

  const operationName =
    parsedFromPayload.operationName ??
    parsedFromUrl.operationName ??
    extractOperationNameFromPath(input.path);

  const query = parsedFromPayload.query ?? parsedFromUrl.query;
  const variables = parsedFromPayload.variables ?? parsedFromUrl.variables;
  const fingerprintVariables = normalizeTweetIdLikeVariablesForFingerprint(variables);
  const variablesShapeHash =
    fingerprintVariables === undefined
      ? undefined
      : hashShape(inferShape(redactSensitiveData(fingerprintVariables)));

  const looksLikeGraphql = byPath || Boolean(operationName || query || variables);
  if (!looksLikeGraphql) {
    return { isGraphql: false };
  }

  return {
    isGraphql: true,
    operationName,
    query,
    variables,
    variablesShapeHash
  };
}

export function buildGraphqlFingerprint(input: {
  method: string;
  path: string;
  operationName?: string;
  variablesShapeHash?: string;
}): string {
  return [
    'gql',
    normalizeMethod(input.method),
    normalizePath(input.path),
    input.operationName ?? 'unknown-op',
    input.variablesShapeHash ?? 'no-vars'
  ].join('|');
}

export function buildRestFingerprint(input: {
  method: string;
  path: string;
  requestShape: XShapeNode;
  responseShape: XShapeNode;
}): string {
  return [
    'rest',
    normalizeMethod(input.method),
    normalizePath(input.path),
    hashShape(input.requestShape),
    hashShape(input.responseShape)
  ].join('|');
}

function parsePayloadAsGraphql(payload: unknown): {
  operationName?: string;
  query?: string;
  variables?: unknown;
} {
  const normalizedPayload = normalizePayload(payload);
  if (!normalizedPayload || typeof normalizedPayload !== 'object') {
    return {};
  }

  const operationName = asString((normalizedPayload as Record<string, unknown>).operationName);
  const query = asString((normalizedPayload as Record<string, unknown>).query);
  const variables = (normalizedPayload as Record<string, unknown>).variables;

  return {
    operationName,
    query,
    variables
  };
}

function parseGraphqlFromUrl(url: string): {
  operationName?: string;
  query?: string;
  variables?: unknown;
} {
  try {
    const parsedUrl = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://x.com');
    const operationName = parsedUrl.searchParams.get('operationName') ?? undefined;
    const query = parsedUrl.searchParams.get('query') ?? undefined;
    const rawVariables = parsedUrl.searchParams.get('variables');
    const variables = rawVariables ? safeJsonParse(rawVariables) ?? rawVariables : undefined;

    return {
      operationName,
      query,
      variables
    };
  } catch {
    return {};
  }
}

function normalizePayload(payload: unknown): unknown {
  if (payload === null || payload === undefined) {
    return undefined;
  }

  if (typeof payload === 'string') {
    return safeJsonParse(payload) ?? undefined;
  }

  return payload;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function normalizeTweetIdLikeVariablesForFingerprint(value: unknown): unknown {
  return normalizeTweetIdLikeValue(value, {
    forceMask: false,
    seen: new WeakSet<object>()
  });
}

function normalizeTweetIdLikeValue(
  value: unknown,
  context: {
    key?: string;
    forceMask: boolean;
    seen: WeakSet<object>;
  }
): unknown {
  const shouldMask = context.forceMask || isTweetIdLikeKey(context.key);

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return shouldMask ? TWEET_ID_FINGERPRINT_PLACEHOLDER : value;
  }

  if (typeof value === 'number') {
    return shouldMask ? Number(TWEET_ID_FINGERPRINT_PLACEHOLDER) : value;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      normalizeTweetIdLikeValue(item, {
        forceMask: shouldMask,
        seen: context.seen
      })
    );
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (context.seen.has(value as object)) {
    return '[Circular]';
  }
  context.seen.add(value as object);

  const output: Record<string, unknown> = {};
  for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
    output[childKey] = normalizeTweetIdLikeValue(childValue, {
      key: childKey,
      forceMask: shouldMask,
      seen: context.seen
    });
  }

  return output;
}

function isTweetIdLikeKey(key: string | undefined): boolean {
  if (!key) {
    return false;
  }

  const normalized = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return normalized.endsWith('tweetid') || normalized.endsWith('tweetids');
}
