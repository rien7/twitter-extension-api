import type {
  XApiGroupedRegistry,
  XApiRegistry,
  XNamespace,
  XUnknownApiInput,
  XUnknownApiRecord,
  XUnknownApiWritableStore
} from '../shared/types';
import { isKnownApiRecord } from './api-registry';
import { createUnknownApiStore, isUnknownApiWritableStore } from './unknown-api-store';

export function ensureXNamespace(): XNamespace {
  const maybeExisting = window.x;
  if (maybeExisting && typeof maybeExisting === 'object') {
    const groupedApi = ensureGroupedApiRegistry(maybeExisting.api);
    maybeExisting.api = groupedApi;
    delete (maybeExisting as Record<string, unknown>).query;
    delete (maybeExisting as Record<string, unknown>).action;
    return maybeExisting;
  }

  const groupedApi = createGroupedApiRegistry();
  const namespace = {
    api: groupedApi
  } as XNamespace;
  namespace.__unknown_api = createUnknownApiStore((input) => isKnownApiRecord(namespace.api, input));

  window.x = namespace;
  return namespace;
}

export function ensureUnknownApiStore(namespace: XNamespace): XUnknownApiWritableStore {
  const existingStore = namespace.__unknown_api;
  if (isUnknownApiWritableStore(existingStore)) {
    return existingStore;
  }

  const store = createUnknownApiStore((input) => isKnownApiRecord(namespace.api, input));
  migrateLegacyRecords(existingStore, store);
  namespace.__unknown_api = store;
  return store;
}

export function recordUnknownApi(
  namespace: XNamespace,
  input: XUnknownApiInput
): XUnknownApiRecord | undefined {
  const store = ensureUnknownApiStore(namespace);
  return store.upsert(input);
}

function migrateLegacyRecords(
  existingStore: unknown,
  targetStore: XUnknownApiWritableStore
): void {
  if (!existingStore || typeof existingStore !== 'object') {
    return;
  }

  const maybeList = (existingStore as { list?: () => unknown }).list;
  if (typeof maybeList !== 'function') {
    return;
  }

  const items = maybeList();
  if (!Array.isArray(items)) {
    return;
  }

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const candidate = item as Partial<XUnknownApiInput>;
    if (!candidate.key || !candidate.fingerprint || !candidate.method || !candidate.path || !candidate.url) {
      continue;
    }

    targetStore.upsert({
      key: candidate.key,
      fingerprint: candidate.fingerprint,
      method: candidate.method,
      path: candidate.path,
      url: candidate.url,
      status: candidate.status,
      isGraphql: Boolean(candidate.isGraphql),
      operationName: candidate.operationName,
      requestShape: candidate.requestShape ?? { kind: 'unknown' },
      responseShape: candidate.responseShape ?? { kind: 'unknown' },
      requestSample: candidate.requestSample,
      responseSample: candidate.responseSample,
      headers: candidate.headers,
      error: candidate.error
    });
  }
}

function ensureGroupedApiRegistry(
  value: unknown
): XApiGroupedRegistry {
  return isGroupedApiRegistry(value) ? value : createGroupedApiRegistry();
}

function createGroupedApiRegistry(): XApiGroupedRegistry {
  return {
    query: {} as XApiRegistry,
    action: {} as XApiRegistry
  };
}

function isGroupedApiRegistry(value: unknown): value is XApiGroupedRegistry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<XApiGroupedRegistry>;
  return (
    !!candidate.query &&
    typeof candidate.query === 'object' &&
    !!candidate.action &&
    typeof candidate.action === 'object'
  );
}
