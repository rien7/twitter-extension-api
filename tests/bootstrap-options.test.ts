import { afterEach, describe, expect, it, vi } from 'vitest';

import { bootstrapTwitterExtensionApiSdk } from '../src';
import { __resetSelfUserIdForTests } from '../src/sdk/self-user-id';

describe('bootstrap options', () => {
  afterEach(() => {
    __resetSelfUserIdForTests();
    vi.unstubAllGlobals();
  });

  it('does not install network interceptors by default', () => {
    const originalFetch = vi.fn(async () => new Response('{}', { status: 200 }));

    class MockXmlHttpRequest {
      open() {
        // noop
      }

      setRequestHeader() {
        // noop
      }

      send() {
        // noop
      }

      addEventListener() {
        // noop
      }
    }

    vi.stubGlobal('XMLHttpRequest', MockXmlHttpRequest);
    vi.stubGlobal('document', { cookie: '' });
    vi.stubGlobal('window', {
      fetch: originalFetch
    });

    const namespace = bootstrapTwitterExtensionApiSdk();

    expect(namespace.api.query).toBeDefined();
    expect(namespace.api.action).toBeDefined();
    expect((window as unknown as { __X_TWITTER_API_INTERCEPTOR_INSTALLED__?: boolean }).__X_TWITTER_API_INTERCEPTOR_INSTALLED__).toBeUndefined();
    expect(window.fetch).toBe(originalFetch);
  });

  it('installs network interceptors when unknown API capture is enabled', () => {
    const originalFetch = vi.fn(async () => new Response('{}', { status: 200 }));

    class MockXmlHttpRequest {
      open() {
        // noop
      }

      setRequestHeader() {
        // noop
      }

      send() {
        // noop
      }

      addEventListener() {
        // noop
      }

      get status() {
        return 200;
      }

      get responseText() {
        return '{}';
      }
    }

    vi.stubGlobal('XMLHttpRequest', MockXmlHttpRequest);
    vi.stubGlobal('document', { cookie: '' });
    vi.stubGlobal('window', {
      fetch: originalFetch
    });

    bootstrapTwitterExtensionApiSdk({ enableUnknownApiCapture: true });

    expect((window as unknown as { __X_TWITTER_API_INTERCEPTOR_INSTALLED__?: boolean }).__X_TWITTER_API_INTERCEPTOR_INSTALLED__).toBe(true);
    expect(window.fetch).not.toBe(originalFetch);
  });
});
