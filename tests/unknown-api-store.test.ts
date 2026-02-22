import { describe, expect, it } from 'vitest';

import { isKnownApiRecord } from '../src/sdk/api-registry';
import { createUnknownApiStore } from '../src/sdk/unknown-api-store';
import type { XApiRegistry, XCallableApi } from '../src/shared/types';

describe('__unknown_api store', () => {
  it('filters known API requests by __desc.match', () => {
    const registry: XApiRegistry = {};

    const knownApi = Object.assign(async () => ({}), {
      __desc: {
        id: 'post-tweet',
        title: 'Post Tweet',
        doc: 'doc',
        match: {
          method: 'POST',
          path: '/i/api/graphql/*/CreateTweet',
          operationName: 'CreateTweet'
        },
        requestTypeName: 'PostTweetRequest',
        responseTypeName: 'PostTweetResponse'
      }
    }) as XCallableApi<unknown, unknown>;

    registry['post-tweet'] = knownApi;

    const store = createUnknownApiStore((input) => isKnownApiRecord(registry, input));

    const saved = store.upsert({
      key: 'known',
      fingerprint: 'known',
      method: 'POST',
      path: '/i/api/graphql/abc/CreateTweet',
      url: 'https://x.com/i/api/graphql/abc/CreateTweet',
      isGraphql: true,
      operationName: 'CreateTweet',
      requestShape: { kind: 'object', properties: { text: { kind: 'string' } } },
      responseShape: { kind: 'object', properties: { data: { kind: 'object' } } }
    });

    expect(saved).toBeUndefined();
    expect(store.list()).toHaveLength(0);
  });

  it('deduplicates unknown API entries and increments hit count', () => {
    const store = createUnknownApiStore(() => false);

    store.upsert({
      key: 'unknown-key',
      fingerprint: 'unknown-key',
      method: 'POST',
      path: '/i/api/graphql/new/UnknownOperation',
      url: 'https://x.com/i/api/graphql/new/UnknownOperation',
      isGraphql: true,
      operationName: 'UnknownOperation',
      requestShape: { kind: 'object' },
      responseShape: { kind: 'object' }
    });

    const second = store.upsert({
      key: 'unknown-key',
      fingerprint: 'unknown-key',
      method: 'POST',
      path: '/i/api/graphql/new/UnknownOperation',
      url: 'https://x.com/i/api/graphql/new/UnknownOperation',
      isGraphql: true,
      operationName: 'UnknownOperation',
      requestShape: { kind: 'object' },
      responseShape: { kind: 'object' }
    });

    expect(second?.hits).toBe(2);
    expect(store.list()).toHaveLength(1);
  });
});
