import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const generateTransactionIdMock = vi.fn();
const createTransactionMock = vi.fn(async () => ({
  generateTransactionId: generateTransactionIdMock
}));
const handleXMigrationMock = vi.fn(async () => ({} as Document));

vi.mock('x-client-transaction-id', () => ({
  ClientTransaction: {
    create: createTransactionMock
  },
  handleXMigration: handleXMigrationMock
}));

describe('request headers transaction id', () => {
  beforeEach(() => {
    vi.resetModules();
    generateTransactionIdMock.mockReset();
    createTransactionMock.mockClear();
    handleXMigrationMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('generates a fresh x-client-transaction-id for each request', async () => {
    vi.stubGlobal('window', {
      location: {
        origin: 'https://x.com'
      }
    });

    generateTransactionIdMock
      .mockResolvedValueOnce('transaction-get')
      .mockResolvedValueOnce('transaction-post');

    const { __resetClientTransactionForTests, buildGraphqlHeadersForRequest } = await import(
      '../src/sdk/request-headers'
    );

    __resetClientTransactionForTests();

    const getHeaders = await buildGraphqlHeadersForRequest({
      method: 'GET',
      endpoint: '/i/api/graphql/abc/UserTweetsAndReplies',
      headers: {
        'x-client-transaction-id': 'stale-value'
      }
    });
    const postHeaders = await buildGraphqlHeadersForRequest({
      method: 'POST',
      endpoint: '/i/api/1.1/friendships/create.json'
    });

    expect(getHeaders['x-client-transaction-id']).toBe('transaction-get');
    expect(postHeaders['x-client-transaction-id']).toBe('transaction-post');
    expect(handleXMigrationMock).toHaveBeenCalledTimes(1);
    expect(createTransactionMock).toHaveBeenCalledTimes(1);
    expect(generateTransactionIdMock).toHaveBeenNthCalledWith(
      1,
      'GET',
      '/graphql/abc/UserTweetsAndReplies'
    );
    expect(generateTransactionIdMock).toHaveBeenNthCalledWith(2, 'POST', '/1.1/friendships/create.json');
  });

  it('removes stale transaction id when generator is unavailable', async () => {
    const { buildGraphqlHeadersForRequest } = await import('../src/sdk/request-headers');

    const headers = await buildGraphqlHeadersForRequest({
      method: 'GET',
      endpoint: '/i/api/graphql/abc/UserTweetsAndReplies',
      headers: {
        'x-client-transaction-id': 'stale-value'
      }
    });

    expect(headers['x-client-transaction-id']).toBeUndefined();
    expect(handleXMigrationMock).not.toHaveBeenCalled();
    expect(generateTransactionIdMock).not.toHaveBeenCalled();
  });
});
