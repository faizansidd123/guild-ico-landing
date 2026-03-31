import { pickDefined } from "@/lib/type-guards";

export type PrimitiveQueryValue = string | number | boolean;
export type QueryParams = Record<string, PrimitiveQueryValue | null | undefined>;

type FetchJsonOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: QueryParams;
  headers?: HeadersInit;
  body?: BodyInit | null;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
};

export class HttpRequestError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "HttpRequestError";
    this.status = status;
    this.url = url;
  }
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRY_DELAY_MS = 250;

export const normalizePath = (path: string): string => {
  return path.replace(/^\/+/, "");
};

export const resolveEndpoint = (path: string, baseUrl = ""): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (!baseUrl) {
    return path;
  }

  return `${baseUrl.replace(/\/+$/, "")}/${normalizePath(path)}`;
};

export const withQueryParams = (url: string, query: QueryParams): string => {
  const normalizedQuery = pickDefined(query);
  const entries = Object.entries(normalizedQuery).filter(([, value]) => value !== null);
  if (entries.length === 0) {
    return url;
  }

  const params = new URLSearchParams();
  entries.forEach(([key, value]) => {
    params.set(key, String(value));
  });

  const serialized = params.toString();
  if (!serialized) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}${serialized}`;
};

const sleep = (delayMs: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
};

const parseJsonSafely = (payload: string): unknown => {
  if (!payload.trim()) {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
};

const mergeHeaders = (headers: HeadersInit | undefined): HeadersInit => {
  const defaults = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (!headers) {
    return defaults;
  }

  if (headers instanceof Headers) {
    const merged = new Headers(defaults);
    headers.forEach((value, key) => {
      merged.set(key, value);
    });
    return merged;
  }

  if (Array.isArray(headers)) {
    return [...Object.entries(defaults), ...headers];
  }

  return {
    ...defaults,
    ...headers,
  };
};

const getErrorMessageFromPayload = (payload: unknown): string | null => {
  if (!payload) return null;
  if (typeof payload === "string") {
    const normalized = payload.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (typeof payload === "object") {
    const value = payload as Record<string, unknown>;
    const message =
      typeof value.message === "string"
        ? value.message
        : typeof value.error === "string"
          ? value.error
          : typeof value.error === "object" &&
              value.error &&
              typeof (value.error as Record<string, unknown>).message === "string"
            ? ((value.error as Record<string, unknown>).message as string)
            : null;

    if (message && message.trim().length > 0) {
      return message;
    }
  }

  return null;
};

const shouldRetryForError = (error: unknown): boolean => {
  if (error instanceof HttpRequestError) {
    return error.status >= 500;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  return error instanceof TypeError;
};

export const fetchJson = async <T>(url: string, options: FetchJsonOptions = {}): Promise<T> => {
  const {
    method = "GET",
    query,
    body = null,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = 0,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  } = options;

  const targetUrl = query ? withQueryParams(url, query) : url;
  const maxAttempts = Math.max(1, Math.trunc(retries) + 1);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeoutMs);

    try {
      const response = await fetch(targetUrl, {
        method,
        headers: mergeHeaders(headers),
        body,
        signal: abortController.signal,
      });

      const textPayload = await response.text();
      const parsedPayload = parseJsonSafely(textPayload);

      if (!response.ok) {
        const message =
          getErrorMessageFromPayload(parsedPayload) ||
          `Request failed (${response.status})`;
        throw new HttpRequestError(message, response.status, targetUrl);
      }

      return parsedPayload as T;
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt || !shouldRetryForError(error)) {
        throw error;
      }

      const backoffDelay = retryDelayMs * attempt;
      await sleep(backoffDelay);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error("Unexpected HTTP execution path.");
};
