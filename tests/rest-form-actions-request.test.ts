import { afterEach, describe, expect, it, vi } from 'vitest';

import { block } from '../api/action/block';
import { follow } from '../api/action/follow';
import { unblock } from '../api/action/unblock';
import { unfollow } from '../api/action/unfollow';
import { setLatestGraphqlHeaders } from '../src/sdk/request-headers';

interface RestActionCase {
  name: string;
  run: (input: { userId: string }) => Promise<unknown>;
}

const REST_ACTION_CASES: RestActionCase[] = [
  { name: 'follow', run: follow },
  { name: 'unfollow', run: unfollow },
  { name: 'block', run: block },
  { name: 'unblock', run: unblock }
];

describe.each(REST_ACTION_CASES)('$name request format', ({ run }) => {
  afterEach(() => {
    setLatestGraphqlHeaders(null);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('forces form content-type even when latest captured headers are JSON', async () => {
    setLatestGraphqlHeaders({
      authorization: 'Bearer from-capture',
      'content-type': 'application/json'
    });

    const mockFetch = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
      return new Response(JSON.stringify({ id_str: '1468298719447887872' }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    });
    vi.stubGlobal('fetch', mockFetch);

    await run({ userId: '1468298719447887872' });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    const requestInit = (mockFetch.mock.calls[0]?.[1] ?? {}) as RequestInit;
    const requestHeaders = requestInit.headers as Record<string, string>;

    expect(requestHeaders['content-type']).toBe('application/x-www-form-urlencoded; charset=UTF-8');
    expect(requestHeaders.accept).toBe('application/json, text/plain, */*');
    expect(typeof requestInit.body).toBe('string');
    expect(String(requestInit.body)).toContain('user_id=1468298719447887872');
  });
});
