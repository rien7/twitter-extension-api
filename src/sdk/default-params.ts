import { getSelfUserId } from './self-user-id';

export function resolveDefaultParamsWithSelfUserId<T>(value: T): T {
  const selfUserId = getSelfUserId();
  return cloneWithInjectedSelfUserId(value, selfUserId) as T;
}

function cloneWithInjectedSelfUserId(value: unknown, selfUserId: string | undefined): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => cloneWithInjectedSelfUserId(item, selfUserId));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const output: Record<string, unknown> = {};
  for (const [key, rawValue] of Object.entries(value as Record<string, unknown>)) {
    if (selfUserId && isUserIdLikeKey(key) && typeof rawValue === 'string') {
      output[key] = selfUserId;
      continue;
    }

    output[key] = cloneWithInjectedSelfUserId(rawValue, selfUserId);
  }

  return output;
}

function isUserIdLikeKey(key: string): boolean {
  const normalized = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return normalized.endsWith('userid');
}
