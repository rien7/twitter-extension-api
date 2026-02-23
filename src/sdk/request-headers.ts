import { ClientTransaction, handleXMigration } from 'x-client-transaction-id';

const REPLAY_HEADER_IGNORE_LIST = new Set(['content-length', 'host', 'origin', 'referer']);

let latestGraphqlHeaders: Record<string, string> | null = null;
let clientTransactionPromise: Promise<ClientTransaction> | null = null;

export interface BuildGraphqlHeadersForRequestInput {
  method: string;
  endpoint: string;
  headers?: Record<string, string>;
}

export function setLatestGraphqlHeaders(headers: Record<string, string> | null): void {
  latestGraphqlHeaders = headers ? sanitizeReplayHeaders(headers) : null;
}

export function getLatestGraphqlHeaders(): Record<string, string> | null {
  if (!latestGraphqlHeaders) {
    return null;
  }
  return { ...latestGraphqlHeaders };
}

export function sanitizeReplayHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [rawKey, rawValue] of Object.entries(headers)) {
    if (!rawKey) {
      continue;
    }

    const key = rawKey.toLowerCase();
    if (REPLAY_HEADER_IGNORE_LIST.has(key)) {
      continue;
    }

    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    result[key] = String(rawValue);
  }

  return result;
}

export function buildGraphqlHeaders(
  templateHeaders?: Record<string, string> | undefined
): Record<string, string> {
  const headers: Record<string, string> = {};

  const merge = (source?: Record<string, string> | null): void => {
    if (!source) {
      return;
    }

    const sanitized = sanitizeReplayHeaders(source);
    for (const [key, value] of Object.entries(sanitized)) {
      headers[key] = value;
    }
  };

  // Latest captured headers provide runtime session tokens.
  // Template headers are explicit call-site intent and must win on conflicts.
  merge(latestGraphqlHeaders);
  merge(templateHeaders);

  const csrfToken = getCookieValue('ct0');
  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  }

  if (!headers['x-twitter-active-user']) {
    headers['x-twitter-active-user'] = 'yes';
  }

  if (!headers['x-twitter-client-language']) {
    headers['x-twitter-client-language'] =
      getDocumentLanguage() ?? getNavigatorLanguage() ?? 'en';
  }

  if (!headers['accept-language']) {
    headers['accept-language'] = getAcceptLanguageHeader();
  }

  if (!headers.accept) {
    headers.accept = '*/*';
  }

  const authorization =
    normalizeAuthorization(headers.authorization) ??
    normalizeAuthorization(latestGraphqlHeaders?.authorization) ??
    normalizeAuthorization(templateHeaders?.authorization) ??
    sniffAuthorizationFromGlobals();

  if (authorization) {
    headers.authorization = authorization;
  }

  if (!headers['x-twitter-auth-type']) {
    headers['x-twitter-auth-type'] = 'OAuth2Session';
  }

  if (!headers['content-type']) {
    headers['content-type'] = 'application/json';
  }

  return headers;
}

export async function buildGraphqlHeadersForRequest(
  input: BuildGraphqlHeadersForRequestInput
): Promise<Record<string, string>> {
  const headers = buildGraphqlHeaders(input.headers);

  // Always refresh transaction id per request; stale captured ids are not reusable.
  delete headers['x-client-transaction-id'];

  const transactionPath = resolveTransactionPath(input.endpoint);
  if (!transactionPath) {
    return headers;
  }

  const transactionId = await generateClientTransactionId(input.method, transactionPath);
  if (transactionId) {
    headers['x-client-transaction-id'] = transactionId;
  }

  return headers;
}

export function __resetClientTransactionForTests(): void {
  clientTransactionPromise = null;
}

async function generateClientTransactionId(
  method: string,
  path: string
): Promise<string | undefined> {
  if (!canGenerateClientTransactionId()) {
    return undefined;
  }

  try {
    const transaction = await getClientTransaction();
    return await transaction.generateTransactionId(method.toUpperCase(), path);
  } catch {
    return undefined;
  }
}

function canGenerateClientTransactionId(): boolean {
  return typeof window !== 'undefined' && typeof fetch === 'function';
}

async function getClientTransaction(): Promise<ClientTransaction> {
  if (!clientTransactionPromise) {
    clientTransactionPromise = createClientTransaction();
  }

  try {
    return await clientTransactionPromise;
  } catch (error) {
    clientTransactionPromise = null;
    throw error;
  }
}

async function createClientTransaction(): Promise<ClientTransaction> {
  const homeDocument = await handleXMigration();
  return ClientTransaction.create(homeDocument);
}

function resolveTransactionPath(endpoint: string): string | undefined {
  const trimmedEndpoint = endpoint.trim();
  if (!trimmedEndpoint) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(trimmedEndpoint, getBrowserOrigin());
    return normalizeTransactionPath(parsedUrl.pathname);
  } catch {
    return undefined;
  }
}

function getBrowserOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'https://x.com';
}

function normalizeTransactionPath(pathname: string): string {
  const withoutApiPrefix = pathname.startsWith('/i/api')
    ? pathname.slice('/i/api'.length)
    : pathname;

  if (!withoutApiPrefix) {
    return '/';
  }

  return withoutApiPrefix.startsWith('/') ? withoutApiPrefix : `/${withoutApiPrefix}`;
}

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie?.split(';') ?? [];
  for (const cookie of cookies) {
    const [rawKey, ...rest] = cookie.trim().split('=');
    if (rawKey === name) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
}

function normalizeAuthorization(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.startsWith('Bearer ') ? trimmed : `Bearer ${trimmed}`;
}

function sniffAuthorizationFromGlobals(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const globalCandidate = window as unknown as {
    __INITIAL_STATE__?: unknown;
    __INITIAL_DATA__?: unknown;
    __NEXT_DATA__?: unknown;
    localStorage?: Storage;
    sessionStorage?: Storage;
  };

  const candidates: unknown[] = [];

  const maybeInitialState = globalCandidate.__INITIAL_STATE__ as
    | { session?: { bearerToken?: string }; config?: { bearerToken?: string } }
    | undefined;
  if (maybeInitialState) {
    candidates.push(maybeInitialState.session?.bearerToken);
    candidates.push(maybeInitialState.config?.bearerToken);
  }

  const maybeInitialData = globalCandidate.__INITIAL_DATA__ as
    | { session?: { bearerToken?: string }; config?: { bearerToken?: string } }
    | undefined;
  if (maybeInitialData) {
    candidates.push(maybeInitialData.session?.bearerToken);
    candidates.push(maybeInitialData.config?.bearerToken);
  }

  const maybeNextData = globalCandidate.__NEXT_DATA__ as
    | {
        props?: {
          pageProps?: {
            apollo?: { session?: { bearerToken?: string } };
            session?: { bearerToken?: string };
          };
        };
      }
    | undefined;
  if (maybeNextData) {
    candidates.push(maybeNextData.props?.pageProps?.apollo?.session?.bearerToken);
    candidates.push(maybeNextData.props?.pageProps?.session?.bearerToken);
  }

  for (const candidate of candidates) {
    const normalized = normalizeAuthorization(typeof candidate === 'string' ? candidate : undefined);
    if (normalized) {
      return normalized;
    }
  }

  return (
    sniffAuthorizationFromStorage(globalCandidate.localStorage) ??
    sniffAuthorizationFromStorage(globalCandidate.sessionStorage)
  );
}

function sniffAuthorizationFromStorage(storage: Storage | undefined): string | undefined {
  if (!storage) {
    return undefined;
  }

  try {
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key) {
        continue;
      }

      const rawValue = storage.getItem(key);
      if (!rawValue) {
        continue;
      }

      const direct = normalizeAuthorization(rawValue);
      if (direct) {
        return direct;
      }

      if (rawValue.includes('bearerToken')) {
        try {
          const parsed = JSON.parse(rawValue) as
            | { bearerToken?: string; session?: { bearerToken?: string } }
            | undefined;
          const parsedToken = normalizeAuthorization(
            parsed?.bearerToken ?? parsed?.session?.bearerToken
          );
          if (parsedToken) {
            return parsedToken;
          }
        } catch {
          // Ignore invalid json in storage values.
        }
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getDocumentLanguage(): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  return document.documentElement?.lang || undefined;
}

function getNavigatorLanguage(): string | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return navigator.language || undefined;
}

function getAcceptLanguageHeader(): string {
  if (typeof navigator === 'undefined') {
    return 'en-US';
  }

  const languageList = Array.isArray(navigator.languages)
    ? navigator.languages.filter((lang) => Boolean(lang))
    : [];

  if (languageList.length > 0) {
    return languageList.join(',');
  }

  return navigator.language || 'en-US';
}
