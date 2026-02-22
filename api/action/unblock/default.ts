import type { UnblockForm, UnblockRequest, UnblockResolvedRequest } from './types';

export const DEFAULT_UNBLOCK_ENDPOINT = '/i/api/1.1/blocks/destroy.json';

export const DEFAULT_UNBLOCK_FORM: UnblockForm = {
  user_id: ''
};

export function buildUnblockRequest(input: UnblockRequest): UnblockResolvedRequest {
  if (!input.userId) {
    throw new Error('unblock requires a non-empty userId');
  }

  const form = mergeDefined(DEFAULT_UNBLOCK_FORM, input.formOverride);
  form.user_id = input.userId;

  return {
    endpoint: input.endpoint ?? DEFAULT_UNBLOCK_ENDPOINT,
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
