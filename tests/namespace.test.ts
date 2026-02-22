import { afterEach, describe, expect, it, vi } from 'vitest';

import { ensureXNamespace } from '../src/sdk/global';

describe('window.x namespace shape', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates grouped API registry under window.x.api only', () => {
    vi.stubGlobal('window', {});

    const namespace = ensureXNamespace();

    expect(namespace.api.query).toBeDefined();
    expect(namespace.api.action).toBeDefined();
    expect((namespace as Record<string, unknown>).query).toBeUndefined();
    expect((namespace as Record<string, unknown>).action).toBeUndefined();
  });

  it('removes legacy top-level query/action aliases when namespace already exists', () => {
    vi.stubGlobal('window', {
      x: {
        api: {
          query: {},
          action: {}
        },
        query: {
          legacy: true
        },
        action: {
          legacy: true
        }
      }
    });

    const namespace = ensureXNamespace() as Record<string, unknown>;

    expect(namespace.api).toBeDefined();
    expect(namespace.query).toBeUndefined();
    expect(namespace.action).toBeUndefined();
  });
});
