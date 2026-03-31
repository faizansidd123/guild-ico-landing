export type CacheEntry<T> = {
  value: T;
  expiresAt: number | null;
};

const now = () => Date.now();

export class TtlCache<K, V> {
  private readonly store = new Map<K, CacheEntry<V>>();

  set(key: K, value: V, ttlMs?: number): void {
    const expiresAt =
      typeof ttlMs === "number" && Number.isFinite(ttlMs) && ttlMs > 0
        ? now() + Math.trunc(ttlMs)
        : null;

    this.store.set(key, { value, expiresAt });
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt !== null && entry.expiresAt <= now()) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    this.compact();
    return this.store.size;
  }

  keys(): K[] {
    this.compact();
    return Array.from(this.store.keys());
  }

  compact(): void {
    const current = now();

    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt !== null && entry.expiresAt <= current) {
        this.store.delete(key);
      }
    }
  }
}

export class LruCache<K, V> {
  private readonly store = new Map<K, V>();
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = Math.max(1, Math.trunc(capacity));
  }

  get(key: K): V | undefined {
    if (!this.store.has(key)) {
      return undefined;
    }

    const value = this.store.get(key) as V;
    this.store.delete(key);
    this.store.set(key, value);

    return value;
  }

  set(key: K, value: V): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    }

    this.store.set(key, value);

    if (this.store.size > this.capacity) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  delete(key: K): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  keys(): K[] {
    return Array.from(this.store.keys());
  }
}

export const memoizeByKey = <Args extends unknown[], Result>(
  keySelector: (...args: Args) => string,
  executor: (...args: Args) => Result,
): ((...args: Args) => Result) => {
  const cache = new Map<string, Result>();

  return (...args: Args): Result => {
    const key = keySelector(...args);

    if (cache.has(key)) {
      return cache.get(key) as Result;
    }

    const value = executor(...args);
    cache.set(key, value);
    return value;
  };
};

export const memoizePromiseByKey = <Args extends unknown[], Result>(
  keySelector: (...args: Args) => string,
  executor: (...args: Args) => Promise<Result>,
): ((...args: Args) => Promise<Result>) => {
  const cache = new Map<string, Promise<Result>>();

  return (...args: Args): Promise<Result> => {
    const key = keySelector(...args);

    if (cache.has(key)) {
      return cache.get(key) as Promise<Result>;
    }

    const request = executor(...args)
      .then((value) => value)
      .catch((error) => {
        cache.delete(key);
        throw error;
      });

    cache.set(key, request);
    return request;
  };
};

export const createTtlMemoized = <Args extends unknown[], Result>(
  keySelector: (...args: Args) => string,
  ttlMs: number,
  executor: (...args: Args) => Result,
): ((...args: Args) => Result) => {
  const cache = new TtlCache<string, Result>();

  return (...args: Args): Result => {
    const key = keySelector(...args);
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = executor(...args);
    cache.set(key, value, ttlMs);
    return value;
  };
};

export const createTtlMemoizedAsync = <Args extends unknown[], Result>(
  keySelector: (...args: Args) => string,
  ttlMs: number,
  executor: (...args: Args) => Promise<Result>,
): ((...args: Args) => Promise<Result>) => {
  const cache = new TtlCache<string, Promise<Result>>();

  return (...args: Args): Promise<Result> => {
    const key = keySelector(...args);
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    const promise = executor(...args).catch((error) => {
      cache.delete(key);
      throw error;
    });

    cache.set(key, promise, ttlMs);
    return promise;
  };
};

export const runWithLock = async <T>(
  lockMap: Map<string, Promise<T>>,
  key: string,
  task: () => Promise<T>,
): Promise<T> => {
  const existing = lockMap.get(key);
  if (existing) {
    return existing;
  }

  const pending = task().finally(() => {
    lockMap.delete(key);
  });

  lockMap.set(key, pending);
  return pending;
};

export const createAsyncDeduper = <Args extends unknown[], Result>(
  keySelector: (...args: Args) => string,
  executor: (...args: Args) => Promise<Result>,
): ((...args: Args) => Promise<Result>) => {
  const inflight = new Map<string, Promise<Result>>();

  return (...args: Args): Promise<Result> => {
    const key = keySelector(...args);

    return runWithLock(inflight, key, () => executor(...args));
  };
};
