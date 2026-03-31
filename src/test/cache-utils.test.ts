import { describe, expect, it, vi } from "vitest";

import {
  LruCache,
  TtlCache,
  createAsyncDeduper,
  createTtlMemoized,
  createTtlMemoizedAsync,
  memoizeByKey,
  memoizePromiseByKey,
  runWithLock,
} from "@/lib/cache-utils";

describe("cache-utils", () => {
  it("TtlCache stores and retrieves values without ttl", () => {
    const cache = new TtlCache<string, number>();

    cache.set("a", 1);
    expect(cache.get("a")).toBe(1);
    expect(cache.has("a")).toBe(true);
    expect(cache.size()).toBe(1);
  });

  it("TtlCache expires values with ttl", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const cache = new TtlCache<string, number>();
    cache.set("a", 1, 1000);

    expect(cache.get("a")).toBe(1);

    vi.advanceTimersByTime(999);
    expect(cache.get("a")).toBe(1);

    vi.advanceTimersByTime(2);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.has("a")).toBe(false);

    vi.useRealTimers();
  });

  it("TtlCache delete and clear remove values", () => {
    const cache = new TtlCache<string, number>();
    cache.set("a", 1);
    cache.set("b", 2);

    expect(cache.delete("a")).toBe(true);
    expect(cache.get("a")).toBeUndefined();

    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it("TtlCache keys reflects non-expired entries", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const cache = new TtlCache<string, number>();
    cache.set("a", 1, 1000);
    cache.set("b", 2, 2000);

    expect(cache.keys()).toEqual(["a", "b"]);

    vi.advanceTimersByTime(1500);
    expect(cache.keys()).toEqual(["b"]);

    vi.useRealTimers();
  });

  it("LruCache stores values within capacity", () => {
    const cache = new LruCache<string, number>(2);

    cache.set("a", 1);
    cache.set("b", 2);

    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBe(2);
    expect(cache.size()).toBe(2);
  });

  it("LruCache evicts least recently used values", () => {
    const cache = new LruCache<string, number>(2);

    cache.set("a", 1);
    cache.set("b", 2);

    // Touch a so b becomes least recently used.
    expect(cache.get("a")).toBe(1);

    cache.set("c", 3);

    expect(cache.has("a")).toBe(true);
    expect(cache.has("b")).toBe(false);
    expect(cache.has("c")).toBe(true);
  });

  it("LruCache updates value and recency on set", () => {
    const cache = new LruCache<string, number>(2);

    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("a", 10);
    cache.set("c", 3);

    expect(cache.get("a")).toBe(10);
    expect(cache.has("b")).toBe(false);
    expect(cache.has("c")).toBe(true);
  });

  it("LruCache delete and clear work as expected", () => {
    const cache = new LruCache<string, number>(2);

    cache.set("a", 1);
    cache.set("b", 2);

    expect(cache.delete("a")).toBe(true);
    expect(cache.has("a")).toBe(false);

    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it("memoizeByKey memoizes synchronous results", () => {
    const executor = vi.fn((value: number) => value * 2);

    const memoized = memoizeByKey(
      (value: number) => `k:${value}`,
      executor,
    );

    expect(memoized(2)).toBe(4);
    expect(memoized(2)).toBe(4);
    expect(memoized(3)).toBe(6);

    expect(executor).toHaveBeenCalledTimes(2);
  });

  it("memoizePromiseByKey memoizes in-flight and resolved promises", async () => {
    const executor = vi.fn(async (value: number) => {
      return value * 10;
    });

    const memoized = memoizePromiseByKey(
      (value: number) => `k:${value}`,
      executor,
    );

    const [first, second] = await Promise.all([memoized(2), memoized(2)]);

    expect(first).toBe(20);
    expect(second).toBe(20);
    expect(executor).toHaveBeenCalledTimes(1);

    const third = await memoized(2);
    expect(third).toBe(20);
    expect(executor).toHaveBeenCalledTimes(1);
  });

  it("memoizePromiseByKey evicts failed promises", async () => {
    const executor = vi
      .fn<(...args: [number]) => Promise<number>>()
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValueOnce(100);

    const memoized = memoizePromiseByKey(
      (value: number) => `k:${value}`,
      executor,
    );

    await expect(memoized(1)).rejects.toThrow("temporary");
    const recovered = await memoized(1);

    expect(recovered).toBe(100);
    expect(executor).toHaveBeenCalledTimes(2);
  });

  it("createTtlMemoized caches sync values by ttl", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const executor = vi.fn((value: number) => value + 1);
    const memoized = createTtlMemoized(
      (value: number) => `k:${value}`,
      1000,
      executor,
    );

    expect(memoized(1)).toBe(2);
    expect(memoized(1)).toBe(2);
    expect(executor).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1001);
    expect(memoized(1)).toBe(2);
    expect(executor).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("createTtlMemoizedAsync caches async values by ttl", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const executor = vi.fn(async (value: number) => value + 5);
    const memoized = createTtlMemoizedAsync(
      (value: number) => `k:${value}`,
      1000,
      executor,
    );

    const first = await memoized(1);
    const second = await memoized(1);

    expect(first).toBe(6);
    expect(second).toBe(6);
    expect(executor).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1001);
    const third = await memoized(1);

    expect(third).toBe(6);
    expect(executor).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("createTtlMemoizedAsync removes failed entries", async () => {
    const executor = vi
      .fn<(...args: [number]) => Promise<number>>()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(7);

    const memoized = createTtlMemoizedAsync(
      (value: number) => `k:${value}`,
      1000,
      executor,
    );

    await expect(memoized(1)).rejects.toThrow("boom");
    const recovered = await memoized(1);

    expect(recovered).toBe(7);
    expect(executor).toHaveBeenCalledTimes(2);
  });

  it("runWithLock shares the same pending promise per key", async () => {
    const locks = new Map<string, Promise<number>>();

    const task = vi.fn(async () => {
      await Promise.resolve();
      return 100;
    });

    const [first, second] = await Promise.all([
      runWithLock(locks, "k", task),
      runWithLock(locks, "k", task),
    ]);

    expect(first).toBe(100);
    expect(second).toBe(100);
    expect(task).toHaveBeenCalledTimes(1);
    expect(locks.has("k")).toBe(false);
  });

  it("createAsyncDeduper deduplicates concurrent requests", async () => {
    const executor = vi.fn(async (value: number) => {
      await Promise.resolve();
      return value * 2;
    });

    const deduper = createAsyncDeduper(
      (value: number) => `k:${value}`,
      executor,
    );

    const [first, second] = await Promise.all([deduper(5), deduper(5)]);

    expect(first).toBe(10);
    expect(second).toBe(10);
    expect(executor).toHaveBeenCalledTimes(1);

    const third = await deduper(5);
    expect(third).toBe(10);
    expect(executor).toHaveBeenCalledTimes(2);
  });

  it("createAsyncDeduper handles independent keys", async () => {
    const executor = vi.fn(async (value: number) => value * 3);

    const deduper = createAsyncDeduper(
      (value: number) => `k:${value}`,
      executor,
    );

    const [first, second] = await Promise.all([deduper(1), deduper(2)]);

    expect(first).toBe(3);
    expect(second).toBe(6);
    expect(executor).toHaveBeenCalledTimes(2);
  });
});
