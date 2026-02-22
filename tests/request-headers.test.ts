import { describe, expect, it } from 'vitest';

import {
  buildGraphqlHeaders,
  sanitizeReplayHeaders,
  setLatestGraphqlHeaders
} from '../src/sdk/request-headers';

describe('request headers builder', () => {
  it('sanitizes replay headers and drops forbidden keys', () => {
    const sanitized = sanitizeReplayHeaders({
      Authorization: 'Bearer abc',
      'X-CSRF-Token': 'csrf-token',
      Host: 'x.com',
      Origin: 'https://x.com',
      Referer: 'https://x.com/home',
      'Content-Length': '123',
      Accept: '*/*'
    });

    expect(sanitized.authorization).toBe('Bearer abc');
    expect(sanitized['x-csrf-token']).toBe('csrf-token');
    expect(sanitized.accept).toBe('*/*');
    expect(sanitized.host).toBeUndefined();
    expect(sanitized.origin).toBeUndefined();
    expect(sanitized.referer).toBeUndefined();
    expect(sanitized['content-length']).toBeUndefined();
  });

  it('builds GraphQL headers with defaults and normalized authorization', () => {
    setLatestGraphqlHeaders(null);

    const headers = buildGraphqlHeaders({
      authorization: 'token-no-bearer-prefix',
      accept: 'application/json'
    });

    expect(headers.authorization).toBe('Bearer token-no-bearer-prefix');
    expect(headers.accept).toBe('application/json');
    expect(headers['content-type']).toBe('application/json');
    expect(headers['x-twitter-auth-type']).toBe('OAuth2Session');
    expect(headers['x-twitter-active-user']).toBe('yes');
    expect(headers['x-twitter-client-language']).toBeTruthy();
    expect(headers['accept-language']).toBeTruthy();
  });

  it('prefers latest captured GraphQL headers when available', () => {
    setLatestGraphqlHeaders({
      authorization: 'Bearer from-capture',
      'x-twitter-client-language': 'ja',
      'x-csrf-token': 'captured-csrf'
    });

    const headers = buildGraphqlHeaders();

    expect(headers.authorization).toBe('Bearer from-capture');
    expect(headers['x-twitter-client-language']).toBe('ja');
    expect(headers['x-csrf-token']).toBeTruthy();
  });

  it('keeps explicit template header values over captured ones', () => {
    setLatestGraphqlHeaders({
      'content-type': 'application/json',
      accept: '*/*',
      authorization: 'Bearer from-capture'
    });

    const headers = buildGraphqlHeaders({
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      accept: 'application/json, text/plain, */*'
    });

    expect(headers['content-type']).toBe('application/x-www-form-urlencoded; charset=UTF-8');
    expect(headers.accept).toBe('application/json, text/plain, */*');
    expect(headers.authorization).toBe('Bearer from-capture');
  });
});
