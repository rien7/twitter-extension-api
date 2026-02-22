import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  __resetSelfUserIdForTests,
  extractUserIdFromTwidValue,
  getSelfUserId,
  initializeSelfUserIdFromCookie,
  resolveSelfUserIdOrThrow
} from '../src/sdk/self-user-id';

describe('self user id from twid cookie', () => {
  afterEach(() => {
    __resetSelfUserIdForTests();
    vi.unstubAllGlobals();
  });

  it('extracts numeric user id from URL-encoded twid value', () => {
    expect(extractUserIdFromTwidValue('u%3D1882474049324081152')).toBe('1882474049324081152');
  });

  it('initializes self user id from cookie and mirrors to window.x', () => {
    vi.stubGlobal('document', {
      cookie: 'twid=u%3D1882474049324081152'
    });
    vi.stubGlobal('window', {
      x: {}
    });

    const resolved = initializeSelfUserIdFromCookie();

    expect(resolved).toBe('1882474049324081152');
    expect(getSelfUserId()).toBe('1882474049324081152');
    expect((window as { x?: { selfUserId?: string } }).x?.selfUserId).toBe('1882474049324081152');
  });

  it('throws when both explicit and cookie-based user id are unavailable', () => {
    vi.stubGlobal('document', {
      cookie: ''
    });

    expect(() => resolveSelfUserIdOrThrow('likes')).toThrowError(
      'default self userId could not be resolved from twid cookie'
    );
  });
});
