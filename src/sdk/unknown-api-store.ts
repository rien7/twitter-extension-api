import type { XUnknownApiInput, XUnknownApiRecord, XUnknownApiWritableStore } from '../shared/types';

export const UNKNOWN_API_STORE_FLAG = '__X_UNKNOWN_API_STORE_WRITABLE__';

export function createUnknownApiStore(
  isKnownRecord: (input: XUnknownApiInput) => boolean
): XUnknownApiWritableStore {
  const records = new Map<string, XUnknownApiRecord>();

  const store: XUnknownApiWritableStore & Record<string, unknown> = {
    upsert(input) {
      if (isKnownRecord(input)) {
        return undefined;
      }

      const now = new Date().toISOString();
      const existing = records.get(input.key);

      if (existing) {
        const nextRecord: XUnknownApiRecord = {
          ...existing,
          ...input,
          firstSeen: existing.firstSeen,
          lastSeen: now,
          hits: existing.hits + 1
        };
        records.set(input.key, nextRecord);
        return cloneRecord(nextRecord);
      }

      const record: XUnknownApiRecord = {
        ...input,
        firstSeen: now,
        lastSeen: now,
        hits: 1
      };
      records.set(input.key, record);
      return cloneRecord(record);
    },

    list() {
      return Array.from(records.values())
        .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
        .map((record) => cloneRecord(record));
    },

    search(text: string | string[]) {
      if (typeof text === 'string') {
        return this.list().filter(value => value.key.toLowerCase().includes(text.toLowerCase()))
      } else if (typeof text === 'object' && 'length' in text) {
        return this.list().filter(value => {
          for (const searchText of text) {
            if (value.key.toLowerCase().includes(searchText.toLowerCase())) {
              return true
            }
          }
          return false
        })
      }
    },

    get(key) {
      const record = records.get(key);
      return record ? cloneRecord(record) : undefined;
    },

    clear() {
      records.clear();
    },

    toJSON(pretty = true) {
      return JSON.stringify(this.list(), null, pretty ? 2 : 0);
    }
  };

  Object.defineProperty(store, UNKNOWN_API_STORE_FLAG, {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  });

  return store;
}

export function isUnknownApiWritableStore(value: unknown): value is XUnknownApiWritableStore {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Boolean((value as Record<string, unknown>)[UNKNOWN_API_STORE_FLAG]);
}

function cloneRecord(record: XUnknownApiRecord): XUnknownApiRecord {
  return JSON.parse(JSON.stringify(record)) as XUnknownApiRecord;
}
