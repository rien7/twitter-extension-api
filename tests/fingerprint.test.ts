import { describe, expect, it } from 'vitest';

import { buildGraphqlFingerprint, buildRestFingerprint, detectGraphqlMeta } from '../src/page/graphql';
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

  it('normalizes tweetId-like variable values when building GraphQL variables hash', () => {
    const one = detectGraphqlMeta({
      method: 'POST',
      path: '/i/api/graphql/hash/FavoriteTweet',
      url: 'https://x.com/i/api/graphql/hash/FavoriteTweet',
      requestPayload: {
        operationName: 'FavoriteTweet',
        variables: {
          tweet_id: '42',
          nested: {
            source_tweet_id: '42'
          },
          list: [
            {
              focalTweetId: '42'
            }
          ]
        }
      }
    });

    const two = detectGraphqlMeta({
      method: 'POST',
      path: '/i/api/graphql/hash/FavoriteTweet',
      url: 'https://x.com/i/api/graphql/hash/FavoriteTweet',
      requestPayload: {
        operationName: 'FavoriteTweet',
        variables: {
          tweet_id: '42',
          nested: {
            source_tweet_id: '42'
          },
          list: [
            {
              focalTweetId: '42'
            }
          ]
        }
      }
    });

    expect(one.isGraphql).toBe(true);
    expect(two.isGraphql).toBe(true);
    expect(one.variablesShapeHash).toBe(two.variablesShapeHash);
  });

  it('keeps non-tweet variable value differences in GraphQL variables hash', () => {
    const one = detectGraphqlMeta({
      method: 'POST',
      path: '/i/api/graphql/hash/SomeOperation',
      url: 'https://x.com/i/api/graphql/hash/SomeOperation',
      requestPayload: {
        operationName: 'SomeOperation',
        variables: {
          user_id: '1'
        }
      }
    });

    const two = detectGraphqlMeta({
      method: 'POST',
      path: '/i/api/graphql/hash/SomeOperation',
      url: 'https://x.com/i/api/graphql/hash/SomeOperation',
      requestPayload: {
        operationName: 'SomeOperation',
        variables: {
          user_id: '999'
        }
      }
    });

    expect(one.isGraphql).toBe(true);
    expect(two.isGraphql).toBe(true);
    expect(one.variablesShapeHash).not.toBe(two.variablesShapeHash);
  });
});
