import type {
  XApiDesc,
  XApiPaginationDesc,
  XCallableApi,
  XCursorCollectResult,
  XCursorPaginateOptions,
  XCursorPaginateStep,
  XCursorPaginationRequest,
  XCursorPaginationResponse
} from '../shared/types';

export async function* paginateCursorApi<
  I extends XCursorPaginationRequest,
  O extends XCursorPaginationResponse
>(
  api: XCallableApi<I, O>,
  input: I,
  options: XCursorPaginateOptions<O> = {}
): AsyncGenerator<XCursorPaginateStep<O>, void, void> {
  const pagination = getCursorPaginationDesc(api.__desc);
  const direction = options.direction ?? 'next';
  const maxPages = options.maxPages ?? Infinity;
  const maxItems = options.maxItems ?? Infinity;
  const extractItems = options.extractItems ?? (() => []);

  let totalItemCount = 0;
  let pageIndex = 0;

  const baseInput = { ...input } as Record<string, unknown>;
  const resolvedCount = resolveRequestedCount(options.count, baseInput, pagination);
  if (resolvedCount !== undefined) {
    baseInput[pagination.countParam] = resolvedCount;
  }

  let cursor = readStringOrUndefined(baseInput[pagination.cursorParam]);
  const seenCursors = new Set<string>();

  while (pageIndex < maxPages && totalItemCount < maxItems) {
    assertNotAborted(options.signal);

    const requestInput = { ...baseInput };
    if (cursor) {
      requestInput[pagination.cursorParam] = cursor;
    } else {
      delete requestInput[pagination.cursorParam];
    }

    const page = await api(requestInput as unknown as I);
    const pageRecord = page as Record<string, unknown>;
    const nextCursor = readStringOrUndefined(pageRecord[pagination.nextCursorField]);
    const prevCursor = pagination.prevCursorField
      ? readStringOrUndefined(pageRecord[pagination.prevCursorField])
      : undefined;
    const hasMore = readHasMore(pageRecord, pagination, nextCursor);

    const pageItems = extractItems(page);
    totalItemCount += pageItems.length;
    pageIndex += 1;

    yield {
      page,
      pageIndex,
      cursorUsed: cursor,
      nextCursor,
      prevCursor,
      itemCount: pageItems.length,
      totalItemCount
    };

    const followingCursor = direction === 'next' ? nextCursor : prevCursor;
    const canContinue = direction === 'next' ? hasMore : Boolean(prevCursor);

    if (!canContinue || !followingCursor) {
      break;
    }

    if (seenCursors.has(followingCursor)) {
      break;
    }

    seenCursors.add(followingCursor);
    cursor = followingCursor;

    if (options.delayMs && options.delayMs > 0) {
      await sleep(options.delayMs, options.signal);
    }

    if (totalItemCount >= maxItems) {
      break;
    }

    if (pageIndex >= maxPages) {
      break;
    }
  }
}

export async function collectCursorPages<
  I extends XCursorPaginationRequest,
  O extends XCursorPaginationResponse
>(
  api: XCallableApi<I, O>,
  input: I,
  options: XCursorPaginateOptions<O> = {}
): Promise<XCursorCollectResult<O>> {
  const pages: O[] = [];
  const items: unknown[] = [];
  const extractItems = options.extractItems ?? (() => []);

  let exhausted = true;
  let nextCursor: string | undefined;
  let prevCursor: string | undefined;

  for await (const step of paginateCursorApi(api, input, {
    ...options,
    extractItems
  })) {
    pages.push(step.page);
    items.push(...extractItems(step.page));
    nextCursor = step.nextCursor;
    prevCursor = step.prevCursor;
  }

  if (pages.length > 0) {
    const lastPage = pages[pages.length - 1] as Record<string, unknown>;
    const pagination = getCursorPaginationDesc(api.__desc);
    const hasMore = readHasMore(
      lastPage,
      pagination,
      readStringOrUndefined(lastPage[pagination.nextCursorField])
    );
    exhausted = !hasMore;
  }

  return {
    pages,
    items,
    exhausted,
    pageCount: pages.length,
    itemCount: items.length,
    nextCursor,
    prevCursor
  };
}

function getCursorPaginationDesc(desc: XApiDesc): XApiPaginationDesc {
  if (!desc.pagination || desc.pagination.strategy !== 'cursor') {
    throw new Error(`API "${desc.id}" does not define cursor pagination metadata in __desc.pagination.`);
  }
  return desc.pagination;
}

function resolveRequestedCount(
  requestedCount: number | undefined,
  baseInput: Record<string, unknown>,
  pagination: XApiPaginationDesc
): number | undefined {
  const inputCount = readNumberOrUndefined(baseInput[pagination.countParam]);
  const rawCount = requestedCount ?? inputCount ?? pagination.defaultCount;

  if (rawCount === undefined) {
    return undefined;
  }

  return clampCount(rawCount, pagination.minCount, pagination.maxCount);
}

function clampCount(value: number, minValue?: number, maxValue?: number): number {
  let output = value;
  if (minValue !== undefined && output < minValue) {
    output = minValue;
  }
  if (maxValue !== undefined && output > maxValue) {
    output = maxValue;
  }
  return output;
}

function readHasMore(
  pageRecord: Record<string, unknown>,
  pagination: XApiPaginationDesc,
  nextCursor?: string
): boolean {
  const hasMoreField = pagination.hasMoreField ?? 'hasMore';
  const rawHasMore = pageRecord[hasMoreField];
  if (typeof rawHasMore === 'boolean') {
    return rawHasMore;
  }
  return Boolean(nextCursor);
}

function readStringOrUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  return value.length > 0 ? value : undefined;
}

function readNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }
  return value;
}

function assertNotAborted(signal: AbortSignal | undefined): void {
  if (!signal?.aborted) {
    return;
  }

  const abortError = new Error('Pagination aborted.');
  abortError.name = 'AbortError';
  throw abortError;
}

async function sleep(delayMs: number, signal?: AbortSignal): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      resolve();
    }, delayMs);

    const onAbort = () => {
      cleanup();
      const abortError = new Error('Pagination aborted.');
      abortError.name = 'AbortError';
      reject(abortError);
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onAbort);
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
