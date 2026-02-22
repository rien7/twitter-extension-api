import type { XShapeNode } from './types';

const SENSITIVE_KEY_PATTERN =
  /(authorization|cookie|token|secret|csrf|password|session|bearer|oauth)/i;
const REDACTED = '[REDACTED]';

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}

export function normalizeMethod(method: string | undefined): string {
  return (method ?? 'GET').toUpperCase();
}

export function normalizePath(input: string): string {
  if (!input) {
    return '/';
  }

  try {
    const url = new URL(input, typeof window !== 'undefined' ? window.location.origin : 'https://x.com');
    return url.pathname || '/';
  } catch {
    const withoutHash = input.split('#')[0] ?? input;
    const withoutQuery = withoutHash.split('?')[0] ?? withoutHash;
    if (!withoutQuery) {
      return '/';
    }
    return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  }
}

export function normalizeUrl(input: string): string {
  if (!input) {
    return '/';
  }

  try {
    const url = new URL(input, typeof window !== 'undefined' ? window.location.origin : 'https://x.com');
    return url.toString();
  } catch {
    return input;
  }
}

export function truncateString(value: string, maxLength = 280): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}...`;
}

export function safeJsonParse(value: string | undefined): unknown {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export function headersToRecord(headers: HeadersInit | undefined | null): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers.map(([key, value]) => [key, String(value)]));
  }

  return Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
    if (Array.isArray(value)) {
      acc[key] = value.join(',');
      return acc;
    }
    acc[key] = String(value);
    return acc;
  }, {});
}

export function sanitizeHeaders(headers: HeadersInit | undefined | null): Record<string, string> {
  const record = headersToRecord(headers);
  return Object.entries(record).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = isSensitiveKey(key) ? REDACTED : value;
    return acc;
  }, {});
}

export function redactSensitiveData(value: unknown, seen?: WeakSet<object>): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item, seen));
  }

  if (typeof value !== 'object') {
    return String(value);
  }

  const trackingSet = seen ?? new WeakSet<object>();
  if (trackingSet.has(value)) {
    return '[Circular]';
  }
  trackingSet.add(value);

  const output: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    output[key] = isSensitiveKey(key)
      ? REDACTED
      : redactSensitiveData(nestedValue, trackingSet);
  }

  return output;
}

export async function serializeBody(body: BodyInit | null | undefined): Promise<unknown> {
  if (body === null || body === undefined) {
    return undefined;
  }

  if (typeof body === 'string') {
    return safeJsonParse(body) ?? truncateString(body, 600);
  }

  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    return Object.fromEntries(body.entries());
  }

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const formDataRecord: Record<string, string | string[]> = {};
    for (const [key, value] of body.entries()) {
      const normalizedValue = typeof value === 'string' ? value : `[Blob:${value.type || 'unknown'}]`;
      const currentValue = formDataRecord[key];
      if (currentValue === undefined) {
        formDataRecord[key] = normalizedValue;
      } else if (Array.isArray(currentValue)) {
        currentValue.push(normalizedValue);
      } else {
        formDataRecord[key] = [currentValue, normalizedValue];
      }
    }
    return formDataRecord;
  }

  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return `[Blob:${body.type || 'unknown'}:${body.size}]`;
  }

  if (body instanceof ArrayBuffer) {
    return `[ArrayBuffer:${body.byteLength}]`;
  }

  if (ArrayBuffer.isView(body)) {
    return `[${body.constructor.name}:${body.byteLength}]`;
  }

  if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) {
    return '[ReadableStream]';
  }

  return String(body);
}

export function inferShape(value: unknown): XShapeNode {
  if (value === null) {
    return { kind: 'null', sample: null };
  }

  if (value === undefined) {
    return { kind: 'unknown' };
  }

  if (typeof value === 'string') {
    return { kind: 'string', sample: truncateString(value, 80) };
  }

  if (typeof value === 'number') {
    return { kind: 'number', sample: value };
  }

  if (typeof value === 'boolean') {
    return { kind: 'boolean', sample: value };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { kind: 'array', element: { kind: 'unknown' } };
    }

    const inferredChildren = value.map((item) => inferShape(item));
    return {
      kind: 'array',
      element: mergeShapeNodes(inferredChildren)
    };
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    const properties = entries.reduce<Record<string, XShapeNode>>((acc, [key, nested]) => {
      acc[key] = inferShape(nested);
      return acc;
    }, {});

    return {
      kind: 'object',
      properties
    };
  }

  return { kind: 'unknown' };
}

export function hashString(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortRecursively(value));
}

export function hashShape(shape: XShapeNode): string {
  return hashString(stableStringify(shape));
}

function mergeShapeNodes(nodes: XShapeNode[]): XShapeNode {
  if (nodes.length === 0) {
    return { kind: 'unknown' };
  }

  const uniqueKinds = Array.from(new Set(nodes.map((node) => node.kind)));
  if (uniqueKinds.length > 1) {
    return {
      kind: 'unknown',
      variants: uniqueKinds.map((kind) => mergeShapeNodes(nodes.filter((node) => node.kind === kind)))
    };
  }

  const [kind] = uniqueKinds;
  if (kind === 'array') {
    const elements = nodes
      .map((node) => node.element)
      .filter((element): element is XShapeNode => Boolean(element));

    return {
      kind: 'array',
      element: mergeShapeNodes(elements)
    };
  }

  if (kind === 'object') {
    const propertyNames = new Set<string>();
    for (const node of nodes) {
      for (const key of Object.keys(node.properties ?? {})) {
        propertyNames.add(key);
      }
    }

    const mergedProperties: Record<string, XShapeNode> = {};
    for (const propertyName of propertyNames) {
      const propertyShapes = nodes
        .map((node) => node.properties?.[propertyName])
        .filter((node): node is XShapeNode => Boolean(node));
      mergedProperties[propertyName] = mergeShapeNodes(propertyShapes);
    }

    return {
      kind: 'object',
      properties: mergedProperties
    };
  }

  return nodes[0];
}

function sortRecursively(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortRecursively);
  }

  if (value && typeof value === 'object') {
    const sortedKeys = Object.keys(value as Record<string, unknown>).sort();
    return sortedKeys.reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = sortRecursively((value as Record<string, unknown>)[key]);
      return acc;
    }, {});
  }

  return value;
}
