let cachedSelfUserId: string | undefined;

export function __resetSelfUserIdForTests(): void {
  cachedSelfUserId = undefined;
}

export function initializeSelfUserIdFromCookie(): string | undefined {
  const userId = parseSelfUserIdFromDocumentCookie();
  if (!userId) {
    return undefined;
  }

  cachedSelfUserId = userId;

  if (typeof window !== 'undefined' && window.x) {
    window.x.selfUserId = userId;
  }

  return userId;
}

export function getSelfUserId(): string | undefined {
  return cachedSelfUserId ?? parseSelfUserIdFromDocumentCookie();
}

export function resolveSelfUserIdOrThrow(apiId: string): string {
  const userId = getSelfUserId();
  if (userId) {
    return userId;
  }

  throw new Error(
    `${apiId} requires userId, and default self userId could not be resolved from twid cookie. Pass userId explicitly.`
  );
}

export function extractUserIdFromTwidValue(rawTwidValue: string): string | undefined {
  if (!rawTwidValue) {
    return undefined;
  }

  const decoded = safeDecodeURIComponent(rawTwidValue);
  const matched = decoded.match(/\d+/);
  if (!matched) {
    return undefined;
  }

  return matched[0];
}

function parseSelfUserIdFromDocumentCookie(): string | undefined {
  const twidValue = getCookieValue('twid');
  if (!twidValue) {
    return undefined;
  }

  const userId = extractUserIdFromTwidValue(twidValue);
  if (!userId) {
    return undefined;
  }

  cachedSelfUserId = userId;
  return userId;
}

function getCookieValue(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const cookiePairs = document.cookie?.split(';') ?? [];
  for (const pair of cookiePairs) {
    const [rawKey, ...rest] = pair.trim().split('=');
    if (rawKey !== name) {
      continue;
    }

    return rest.join('=');
  }

  return undefined;
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
