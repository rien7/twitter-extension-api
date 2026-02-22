import { describe, expect, it } from 'vitest';

import { buildGraphqlFingerprint, buildRestFingerprint } from '../src/page/graphql';
import { inferShape } from '../src/shared/shape';

describe('fingerprint', () => {
  it('keeps GraphQL fingerprint stable for same operation and variables shape', () => {
    const one = buildGraphqlFingerprint({
      method: 'post',
      path: '/i/api/graphql/hash/CreateTweet',
      operationName: 'CreateTweet',
      variablesShapeHash: 'abc123'
    });

    const two = buildGraphqlFingerprint({
      method: 'POST',
      path: '/i/api/graphql/hash/CreateTweet?x=1',
      operationName: 'CreateTweet',
      variablesShapeHash: 'abc123'
    });

    expect(one).toBe(two);
  });

  it('changes REST fingerprint when request shape changes', () => {
    const one = buildRestFingerprint({
      method: 'POST',
      path: '/api/action',
      requestShape: inferShape({ a: 1 }),
      responseShape: inferShape({ ok: true })
    });

    const two = buildRestFingerprint({
      method: 'POST',
      path: '/api/action',
      requestShape: inferShape({ a: '1' }),
      responseShape: inferShape({ ok: true })
    });

    expect(one).not.toBe(two);
  });
});
