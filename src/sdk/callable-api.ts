import type { XApiMeta, XCallableApi } from '../shared/types';

interface CreateCallableApiOptions<D> {
  desc: string;
  meta: XApiMeta;
  getDefaultParams?: () => D;
}

export function createCallableApi<I, O, D = unknown>(
  impl: (input: I) => Promise<O>,
  options: CreateCallableApiOptions<D>
): XCallableApi<I, O, D> {
  const api = impl as XCallableApi<I, O, D>;
  const descValue = options.desc;

  Object.defineProperty(api, '__desc', {
    enumerable: true,
    configurable: true,
    get() {
      if (typeof console !== 'undefined' && typeof console.log === 'function') {
        console.log(descValue);
      }
      return descValue;
    }
  });

  Object.defineProperty(api, '__meta', {
    enumerable: true,
    configurable: true,
    value: options.meta
  });

  if (options.getDefaultParams) {
    Object.defineProperty(api, '__default_params', {
      enumerable: true,
      configurable: true,
      get: options.getDefaultParams
    });
  }

  return api;
}
