import type { XNamespace, XUnknownApiWritableStore } from '../shared/types';
import {
  headersToRecord,
  inferShape,
  normalizeMethod,
  normalizePath,
  normalizeUrl,
  redactSensitiveData,
  safeJsonParse,
  sanitizeHeaders,
  serializeBody,
  truncateString
} from '../shared/shape';
import { buildGraphqlFingerprint, buildRestFingerprint, detectGraphqlMeta } from './graphql';
import { ensureUnknownApiStore, ensureXNamespace } from '../sdk/global';
import { setLatestGraphqlHeaders } from '../sdk/request-headers';

interface InstallNetworkInterceptorsOptions {
  namespace?: XNamespace;
}

interface XhrMeta {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

const XHR_META = Symbol('twitter-xhr-meta');

export function installNetworkInterceptors(options: InstallNetworkInterceptorsOptions = {}): void {
  if (window.__X_TWITTER_API_INTERCEPTOR_INSTALLED__) {
    return;
  }

  const namespace = options.namespace ?? ensureXNamespace();
  const store = ensureUnknownApiStore(namespace);

  patchFetch(store);
  patchXmlHttpRequest(store);

  window.__X_TWITTER_API_INTERCEPTOR_INSTALLED__ = true;
}

function patchFetch(store: XUnknownApiWritableStore): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const method = normalizeMethod(resolveFetchMethod(input, init));
    const url = resolveFetchUrl(input);
    const path = normalizePath(url);
    const rawHeaders = headersToRecord(resolveFetchHeaders(input, init));
    const headers = sanitizeHeaders(rawHeaders);

    let response: Response | undefined;
    let thrownError: unknown;

    try {
      response = await originalFetch(input, init);
      return response;
    } catch (error) {
      thrownError = error;
      throw error;
    } finally {
      try {
        const requestPayload = await resolveFetchRequestPayload(input, init);
        const responsePayload = await resolveFetchResponsePayload(response);

        upsertCapturedRecord({
          store,
          method,
          path,
          url,
          status: response?.status,
          headers,
          rawHeaders,
          requestPayload,
          responsePayload,
          error: thrownError instanceof Error ? thrownError.message : undefined
        });
      } catch {
        // Keep the page behavior untouched even if capture fails.
      }
    }
  };
}

function patchXmlHttpRequest(store: XUnknownApiWritableStore): void {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

  XMLHttpRequest.prototype.open = function open(
    method: string,
    url: string | URL,
    async?: boolean,
    username?: string | null,
    password?: string | null
  ): void {
    (this as XMLHttpRequest & { [XHR_META]?: XhrMeta })[XHR_META] = {
      method: normalizeMethod(method),
      url: String(url),
      headers: {}
    };

    originalOpen.call(this, method, String(url), async ?? true, username ?? undefined, password ?? undefined);
  };

  XMLHttpRequest.prototype.setRequestHeader = function setRequestHeader(
    header: string,
    value: string
  ): void {
    const meta = ensureXhrMeta(this);
    meta.headers[header] = value;
    originalSetRequestHeader.call(this, header, value);
  };

  XMLHttpRequest.prototype.send = function send(body?: Document | XMLHttpRequestBodyInit | null): void {
    const meta = ensureXhrMeta(this);
    meta.body = serializeXhrBody(body);

    this.addEventListener(
      'loadend',
      () => {
        try {
          const path = normalizePath(meta.url);
          const url = normalizeUrl(meta.url);
          upsertCapturedRecord({
            store,
            method: meta.method,
            path,
            url,
            status: this.status,
            headers: sanitizeHeaders(meta.headers),
            rawHeaders: meta.headers,
            requestPayload: meta.body,
            responsePayload: resolveXhrResponsePayload(this)
          });
        } catch {
          // Keep the page behavior untouched even if capture fails.
        }
      },
      { once: true }
    );

    originalSend.call(this, body ?? null);
  };
}

function upsertCapturedRecord(input: {
  store: XUnknownApiWritableStore;
  method: string;
  path: string;
  url: string;
  status?: number;
  headers: Record<string, string>;
  rawHeaders?: Record<string, string>;
  requestPayload?: unknown;
  responsePayload?: unknown;
  error?: string;
}): void {
  const sanitizedRequestPayload = redactSensitiveData(input.requestPayload);
  const sanitizedResponsePayload = redactSensitiveData(input.responsePayload);

  const requestShape = inferShape(sanitizedRequestPayload);
  const responseShape = inferShape(sanitizedResponsePayload);

  const graphqlMeta = detectGraphqlMeta({
    method: input.method,
    path: input.path,
    url: input.url,
    requestPayload: sanitizedRequestPayload
  });

  if (graphqlMeta.isGraphql && input.rawHeaders) {
    setLatestGraphqlHeaders(input.rawHeaders);
  }

  const fingerprint = graphqlMeta.isGraphql
    ? buildGraphqlFingerprint({
        method: input.method,
        path: input.path,
        operationName: graphqlMeta.operationName,
        variablesShapeHash: graphqlMeta.variablesShapeHash
      })
    : buildRestFingerprint({
        method: input.method,
        path: input.path,
        requestShape,
        responseShape
      });

  input.store.upsert({
    key: fingerprint,
    fingerprint,
    method: input.method,
    path: input.path,
    url: input.url,
    status: input.status,
    isGraphql: graphqlMeta.isGraphql,
    operationName: graphqlMeta.operationName,
    requestShape,
    responseShape,
    requestSample: sanitizedRequestPayload,
    responseSample: sanitizedResponsePayload,
    headers: input.headers,
    error: input.error
  });
}

function resolveFetchMethod(resource: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) {
    return init.method;
  }

  if (typeof Request !== 'undefined' && resource instanceof Request) {
    return resource.method;
  }

  return 'GET';
}

function resolveFetchUrl(resource: RequestInfo | URL): string {
  if (typeof resource === 'string') {
    return normalizeUrl(resource);
  }

  if (resource instanceof URL) {
    return normalizeUrl(resource.toString());
  }

  if (typeof Request !== 'undefined' && resource instanceof Request) {
    return normalizeUrl(resource.url);
  }

  return '/';
}

function resolveFetchHeaders(
  resource: RequestInfo | URL,
  init?: RequestInit
): HeadersInit | undefined {
  if (init?.headers) {
    return init.headers;
  }

  if (typeof Request !== 'undefined' && resource instanceof Request) {
    return resource.headers;
  }

  return undefined;
}

async function resolveFetchRequestPayload(
  resource: RequestInfo | URL,
  init?: RequestInit
): Promise<unknown> {
  if (init?.body !== undefined) {
    return serializeBody(init.body);
  }

  if (typeof Request !== 'undefined' && resource instanceof Request) {
    try {
      const text = await resource.clone().text();
      return safeJsonParse(text) ?? truncateString(text, 600);
    } catch {
      return undefined;
    }
  }

  return undefined;
}

async function resolveFetchResponsePayload(response: Response | undefined): Promise<unknown> {
  if (!response) {
    return undefined;
  }

  try {
    const text = await response.clone().text();
    return safeJsonParse(text) ?? truncateString(text, 600);
  } catch {
    return undefined;
  }
}

function serializeXhrBody(body: Document | XMLHttpRequestBodyInit | null | undefined): unknown {
  if (body === null || body === undefined) {
    return undefined;
  }

  if (typeof body === 'string') {
    return safeJsonParse(body) ?? truncateString(body, 600);
  }

  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    return Object.fromEntries(body.entries());
  }

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const formDataRecord: Record<string, string | string[]> = {};
    for (const [key, value] of body.entries()) {
      const normalizedValue = typeof value === 'string' ? value : `[Blob:${value.type || 'unknown'}]`;
      const current = formDataRecord[key];
      if (current === undefined) {
        formDataRecord[key] = normalizedValue;
      } else if (Array.isArray(current)) {
        current.push(normalizedValue);
      } else {
        formDataRecord[key] = [current, normalizedValue];
      }
    }
    return formDataRecord;
  }

  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return `[Blob:${body.type || 'unknown'}:${body.size}]`;
  }

  if (body instanceof ArrayBuffer) {
    return `[ArrayBuffer:${body.byteLength}]`;
  }

  if (ArrayBuffer.isView(body)) {
    return `[${body.constructor.name}:${body.byteLength}]`;
  }

  if (typeof Document !== 'undefined' && body instanceof Document) {
    return '[Document]';
  }

  return String(body);
}

function resolveXhrResponsePayload(xhr: XMLHttpRequest): unknown {
  if (xhr.responseType === 'json') {
    return xhr.response;
  }

  if (xhr.responseType === 'arraybuffer' && xhr.response instanceof ArrayBuffer) {
    return `[ArrayBuffer:${xhr.response.byteLength}]`;
  }

  if (xhr.responseType === 'blob' && xhr.response instanceof Blob) {
    return `[Blob:${xhr.response.type || 'unknown'}:${xhr.response.size}]`;
  }

  if (xhr.responseType === 'document') {
    return '[Document]';
  }

  const text = xhr.responseText;
  return safeJsonParse(text) ?? truncateString(text, 600);
}

function ensureXhrMeta(xhr: XMLHttpRequest): XhrMeta {
  const trackedXhr = xhr as XMLHttpRequest & { [XHR_META]?: XhrMeta };
  if (!trackedXhr[XHR_META]) {
    trackedXhr[XHR_META] = {
      method: 'GET',
      url: window.location.href,
      headers: {}
    };
  }

  return trackedXhr[XHR_META] as XhrMeta;
}
