import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  HttpRequestError,
  fetchJson,
  normalizePath,
  resolveEndpoint,
  withQueryParams,
} from "@/lib/http-client";

const fetchMock = vi.fn<typeof fetch>();

describe("http-client", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizePath removes leading slashes", () => {
    expect(normalizePath("/path/to/resource")).toBe("path/to/resource");
    expect(normalizePath("////a")).toBe("a");
    expect(normalizePath("already/normalized")).toBe("already/normalized");
  });

  it("resolveEndpoint keeps absolute URLs unchanged", () => {
    expect(resolveEndpoint("https://api.example.com/a", "https://ignored.com")).toBe("https://api.example.com/a");
    expect(resolveEndpoint("http://api.example.com/a", "https://ignored.com")).toBe("http://api.example.com/a");
  });

  it("resolveEndpoint joins relative path with base URL", () => {
    expect(resolveEndpoint("users", "https://api.example.com")).toBe("https://api.example.com/users");
    expect(resolveEndpoint("/users", "https://api.example.com/")).toBe("https://api.example.com/users");
    expect(resolveEndpoint("nested/users", "https://api.example.com/v1")).toBe("https://api.example.com/v1/nested/users");
  });

  it("withQueryParams appends params and skips null/undefined", () => {
    const result = withQueryParams("https://api.example.com/users", {
      page: 2,
      q: "john",
      includeDisabled: false,
      optional: undefined,
      ignored: null,
    });

    expect(result).toContain("page=2");
    expect(result).toContain("q=john");
    expect(result).toContain("includeDisabled=false");
    expect(result.includes("optional")).toBe(false);
    expect(result.includes("ignored")).toBe(false);
  });

  it("withQueryParams preserves existing query strings", () => {
    const result = withQueryParams("https://api.example.com/users?sort=createdAt", {
      page: 3,
    });

    expect(result).toBe("https://api.example.com/users?sort=createdAt&page=3");
  });

  it("fetchJson parses JSON payload", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, value: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const payload = await fetchJson<{ ok: boolean; value: number }>("https://api.example.com/test");

    expect(payload.ok).toBe(true);
    expect(payload.value).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fetchJson returns raw text when payload is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("plain text payload", { status: 200 }));

    const payload = await fetchJson<string>("https://api.example.com/text");

    expect(payload).toBe("plain text payload");
  });

  it("fetchJson applies query params and method options", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await fetchJson("https://api.example.com/items", {
      method: "POST",
      query: {
        page: 1,
        filter: "active",
      },
      body: JSON.stringify({ limit: 10 }),
      headers: {
        "X-Test": "enabled",
      },
    });

    const [calledUrl, calledOptions] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(calledUrl).toContain("page=1");
    expect(calledUrl).toContain("filter=active");
    expect(calledOptions.method).toBe("POST");
    expect(calledOptions.body).toBe(JSON.stringify({ limit: 10 }));
  });

  it("fetchJson throws HttpRequestError with payload message", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Explicit backend message" }), { status: 400 }),
    );

    await expect(fetchJson("https://api.example.com/error")).rejects.toMatchObject({
      name: "HttpRequestError",
      status: 400,
      message: "Explicit backend message",
    });
  });

  it("fetchJson uses fallback message when response has no message", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: false }), { status: 500 }));

    await expect(fetchJson("https://api.example.com/error")).rejects.toMatchObject({
      name: "HttpRequestError",
      status: 500,
      message: "Request failed (500)",
    });
  });

  it("fetchJson retries once for server error and succeeds", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Temporary" }), { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const payload = await fetchJson<{ ok: boolean }>("https://api.example.com/retry", {
      retries: 1,
      retryDelayMs: 1,
    });

    expect(payload.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fetchJson does not retry client errors", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ message: "Bad request" }), { status: 400 }));

    await expect(
      fetchJson("https://api.example.com/no-retry", {
        retries: 3,
        retryDelayMs: 1,
      }),
    ).rejects.toBeInstanceOf(HttpRequestError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fetchJson retries network TypeError", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("Network down"))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const payload = await fetchJson<{ ok: boolean }>("https://api.example.com/network", {
      retries: 1,
      retryDelayMs: 1,
    });

    expect(payload.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fetchJson fails after all retries are exhausted", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Unavailable" }), { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Unavailable" }), { status: 503 }));

    await expect(
      fetchJson("https://api.example.com/fail", {
        retries: 1,
        retryDelayMs: 1,
      }),
    ).rejects.toMatchObject({
      name: "HttpRequestError",
      status: 503,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fetchJson handles nested error payload shape", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { message: "Nested error" } }), { status: 500 }),
    );

    await expect(fetchJson("https://api.example.com/nested")).rejects.toMatchObject({
      message: "Nested error",
    });
  });

  it("fetchJson handles string error payload", async () => {
    fetchMock.mockResolvedValueOnce(new Response("backend plain error", { status: 502 }));

    await expect(fetchJson("https://api.example.com/plain")).rejects.toMatchObject({
      message: "backend plain error",
      status: 502,
    });
  });
});
