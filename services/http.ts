// tiny fetch wrapper — adds a timeout, retries transient failures (max 2),
// and a friendly error shape. used by every call in services/api.ts so the
// retry/fallback story is uniform rather than per-endpoint adhoc try/catch.

export type HttpError = {
  kind: "network" | "timeout" | "http" | "aborted";
  status?: number;
  message: string;
};

export class HttpFailure extends Error {
  readonly detail: HttpError;
  constructor(detail: HttpError) {
    super(detail.message);
    this.detail = detail;
    this.name = "HttpFailure";
  }
}

export type HttpOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
};

const DEFAULT_TIMEOUT = 6000;
const DEFAULT_RETRIES = 2;

// transient http statuses — worth a retry (server / gateway hiccup).
const RETRIABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

async function once(url: string, init: RequestInit, timeoutMs: number, external?: AbortSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  if (external) external.addEventListener("abort", onExternalAbort, { once: true });
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
    if (external) external.removeEventListener("abort", onExternalAbort);
  }
}

const backoffMs = (attempt: number) => 180 * 2 ** attempt + Math.floor(Math.random() * 80);

export async function httpFetch(url: string, options: HttpOptions = {}): Promise<Response> {
  const {
    timeoutMs = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    signal,
    ...init
  } = options;

  let lastError: HttpError = { kind: "network", message: "unknown network failure" };
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await once(url, init, timeoutMs, signal);
      if (res.ok) return res;
      if (!RETRIABLE_STATUSES.has(res.status) || attempt === retries) {
        throw new HttpFailure({
          kind: "http",
          status: res.status,
          message: `${res.status} ${res.statusText}`,
        });
      }
      lastError = { kind: "http", status: res.status, message: `${res.status} ${res.statusText}` };
    } catch (err) {
      if (err instanceof HttpFailure) throw err;
      if (signal?.aborted) {
        throw new HttpFailure({ kind: "aborted", message: "request aborted" });
      }
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      lastError = isAbort
        ? { kind: "timeout", message: "request timed out" }
        : { kind: "network", message: err instanceof Error ? err.message : "network failure" };
      if (attempt === retries) throw new HttpFailure(lastError);
    }
    // small jittered backoff between retries so we don't hammer a flapping
    // server or eat a user's battery in an offline hole.
    await new Promise((r) => setTimeout(r, backoffMs(attempt)));
  }
  throw new HttpFailure(lastError);
}

export async function httpJson<T>(url: string, options: HttpOptions = {}): Promise<T> {
  const res = await httpFetch(url, options);
  return (await res.json()) as T;
}
