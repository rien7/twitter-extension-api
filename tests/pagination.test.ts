import { describe, expect, it } from 'vitest';

import { collectCursorPages, paginateCursorApi } from '../src/sdk/pagination';
import type { XCallableApi } from '../src/shared/types';

interface MockPageResponse {
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  items: number[];
}

type MockPageApi = XCallableApi<{ count?: number; cursor?: string }, MockPageResponse>;

describe('cursor pagination helpers', () => {
  it('iterates pages with cursor strategy and clamps count by descriptor range', async () => {
    const calls: Array<{ count?: number; cursor?: string }> = [];

    const api = Object.assign(
      async (input: { count?: number; cursor?: string }): Promise<MockPageResponse> => {
        calls.push(input);

        if (!input.cursor) {
          return { nextCursor: 'c1', hasMore: true, items: [1, 2] };
        }

        if (input.cursor === 'c1') {
          return { nextCursor: 'c2', prevCursor: 'c0', hasMore: true, items: [3] };
        }

        return { prevCursor: 'c1', hasMore: false, items: [4] };
      },
      {
        __desc: '[mock-timeline]\nPurpose: test cursor pagination.',
        __meta: {
          id: 'mock-timeline',
          title: 'Mock Timeline',
          match: {
            method: 'GET',
            path: '/mock'
          },
          requestTypeName: 'MockRequest',
          responseTypeName: 'MockResponse',
          pagination: {
            strategy: 'cursor',
            countParam: 'count',
            cursorParam: 'cursor',
            nextCursorField: 'nextCursor',
            prevCursorField: 'prevCursor',
            hasMoreField: 'hasMore',
            defaultCount: 20,
            minCount: 1,
            maxCount: 40
          }
        }
      }
    ) as MockPageApi;

    const steps: number[] = [];
    for await (const step of paginateCursorApi(
      api,
      { count: 99 },
      {
        extractItems: (page) => page.items
      }
    )) {
      steps.push(step.itemCount);
    }

    expect(steps).toEqual([2, 1, 1]);
    expect(calls).toEqual([
      { count: 40 },
      { count: 40, cursor: 'c1' },
      { count: 40, cursor: 'c2' }
    ]);
  });

  it('collects pages and reports non-exhausted when maxPages is reached early', async () => {
    const api = Object.assign(
      async (input: { count?: number; cursor?: string }): Promise<MockPageResponse> => {
        if (!input.cursor) {
          return { nextCursor: 'c1', hasMore: true, items: [1, 2] };
        }
        return { hasMore: false, items: [3] };
      },
      {
        __desc: '[mock-timeline]\nPurpose: test cursor pagination.',
        __meta: {
          id: 'mock-timeline',
          title: 'Mock Timeline',
          match: {
            method: 'GET',
            path: '/mock'
          },
          requestTypeName: 'MockRequest',
          responseTypeName: 'MockResponse',
          pagination: {
            strategy: 'cursor',
            countParam: 'count',
            cursorParam: 'cursor',
            nextCursorField: 'nextCursor',
            prevCursorField: 'prevCursor',
            hasMoreField: 'hasMore'
          }
        }
      }
    ) as MockPageApi;

    const collected = await collectCursorPages(api, {}, { maxPages: 1, extractItems: (page) => page.items });

    expect(collected.pageCount).toBe(1);
    expect(collected.itemCount).toBe(2);
    expect(collected.nextCursor).toBe('c1');
    expect(collected.exhausted).toBe(false);
  });

  it('throws when API descriptor does not define cursor pagination metadata', async () => {
    const nonPaginatedApi = Object.assign(
      async (): Promise<MockPageResponse> => ({ hasMore: false, items: [] }),
      {
        __desc: '[non-paginated]\nPurpose: test missing pagination metadata.',
        __meta: {
          id: 'non-paginated',
          title: 'Non Paginated',
          match: {},
          requestTypeName: 'Req',
          responseTypeName: 'Res'
        }
      }
    ) as XCallableApi<{ count?: number; cursor?: string }, MockPageResponse>;

    await expect(async () => {
      for await (const _ of paginateCursorApi(nonPaginatedApi, {})) {
        // no-op
      }
    }).rejects.toThrowError('does not define cursor pagination metadata');
  });
});
