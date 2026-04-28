// lightweight localStorage-backed cache for api reads. each entry stores the
// payload + a timestamp so we can distinguish fresh from stale reads. kept
// deliberately small — no IndexedDB — since every payload we cache is a handful
// of KB of static-ish metadata (routines, lessons, profiles).

const PREFIX = "highfive:cache:v1:";
const QUEUE_KEY = "highfive:queue:v1";

type Entry<T> = { data: T; at: number };

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeGet(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // localStorage can throw on quota/privacy modes — ignore. we fall back to
    // the seeded data, which is worse but still functional.
  }
}

function safeRemove(key: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export function cacheRead<T>(key: string): { data: T; ageMs: number } | null {
  const raw = safeGet(PREFIX + key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Entry<T>;
    if (!parsed || typeof parsed.at !== "number") return null;
    return { data: parsed.data, ageMs: Date.now() - parsed.at };
  } catch {
    return null;
  }
}

export function cacheWrite<T>(key: string, data: T) {
  const entry: Entry<T> = { data, at: Date.now() };
  safeSet(PREFIX + key, JSON.stringify(entry));
}

export function cacheClear(key: string) {
  safeRemove(PREFIX + key);
}

// --- outgoing progress queue ---------------------------------------------

export type QueuedProgress = {
  id: string;
  payload: unknown;
  enqueuedAt: number;
  attempts: number;
};

// phase 9: tiny pub/sub so the network indicator hook updates the moment a
// post enqueues (e.g. mid-routine network blip while the tab is still
// "online") without waiting for a visibilitychange tick to refresh the count.
type QueueListener = () => void;
const _queueListeners = new Set<QueueListener>();

export function subscribeToQueue(listener: QueueListener): () => void {
  _queueListeners.add(listener);
  return () => {
    _queueListeners.delete(listener);
  };
}

function _notifyQueue(): void {
  for (const fn of _queueListeners) fn();
}

export function queueRead(): QueuedProgress[] {
  const raw = safeGet(QUEUE_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as QueuedProgress[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function queueAppend(payload: unknown): QueuedProgress {
  const entry: QueuedProgress = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    payload,
    enqueuedAt: Date.now(),
    attempts: 0,
  };
  const next = [...queueRead(), entry].slice(-200); // cap — don't grow unbounded
  safeSet(QUEUE_KEY, JSON.stringify(next));
  _notifyQueue();
  return entry;
}

export function queueRemove(id: string) {
  const next = queueRead().filter((e) => e.id !== id);
  safeSet(QUEUE_KEY, JSON.stringify(next));
  _notifyQueue();
}

export function queueTouch(id: string) {
  const next = queueRead().map((e) =>
    e.id === id ? { ...e, attempts: e.attempts + 1 } : e,
  );
  safeSet(QUEUE_KEY, JSON.stringify(next));
}

export function queueLength(): number {
  return queueRead().length;
}
