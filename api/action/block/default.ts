import type { BlockForm, BlockRequest, BlockResolvedRequest } from './types';

export const DEFAULT_BLOCK_ENDPOINT = '/i/api/1.1/blocks/create.json';

export const DEFAULT_BLOCK_FORM: BlockForm = {
  user_id: ''
};

export function buildBlockRequest(input: BlockRequest): BlockResolvedRequest {
  if (!input.userId) {
    throw new Error('block requires a non-empty userId');
  }

  const form = mergeDefined(DEFAULT_BLOCK_FORM, input.formOverride);
  form.user_id = input.userId;

  return {
    endpoint: input.endpoint ?? DEFAULT_BLOCK_ENDPOINT,
    headers: input.headers,
    form
  };
}

function mergeDefined<T extends object>(base: T, overrides?: Partial<T>): T {
  const merged = { ...base };

  if (!overrides) {
    return merged;
  }

  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const value = overrides[key];
    if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}
