import { describe, expect, it } from "vitest";

import {
  asPlainObject,
  clampNumber,
  coerceRecord,
  compactArray,
  compactObject,
  compareStringsCaseInsensitive,
  deepMergeObjects,
  ensureArray,
  isPlainObject,
  mapObjectValues,
  normalizeString,
  normalizeStringLower,
  normalizeStringUpper,
  parseIsoDateSafe,
  readFirstBooleanPath,
  readFirstDefinedPath,
  readFirstNumberPath,
  readFirstStringPath,
  readPathValue,
  sortByStringKey,
  toBooleanLike,
  toFiniteNumber,
  toOptionalBooleanLike,
  toOptionalFiniteNumber,
  toOptionalString,
  withDefault,
} from "@/lib/object-normalizers";

describe("object-normalizers", () => {
  it("isPlainObject recognizes plain objects only", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject("value")).toBe(false);
  });

  it("asPlainObject returns object or empty object", () => {
    expect(asPlainObject({ a: 1 })).toEqual({ a: 1 });
    expect(asPlainObject([])).toEqual({});
    expect(asPlainObject(null)).toEqual({});
  });

  it("normalizeString trims string values", () => {
    expect(normalizeString("  hello  ")).toBe("hello");
    expect(normalizeString("")).toBe("");
    expect(normalizeString(123)).toBe("");
  });

  it("normalizeStringLower and normalizeStringUpper transform case", () => {
    expect(normalizeStringLower("  HeLLo  ")).toBe("hello");
    expect(normalizeStringUpper("  HeLLo  ")).toBe("HELLO");
  });

  it("toOptionalString returns undefined for blank values", () => {
    expect(toOptionalString("test")).toBe("test");
    expect(toOptionalString("   ")).toBeUndefined();
    expect(toOptionalString(100)).toBeUndefined();
  });

  it("toFiniteNumber converts numeric strings and numbers", () => {
    expect(toFiniteNumber(10)).toBe(10);
    expect(toFiniteNumber("10.5")).toBe(10.5);
    expect(toFiniteNumber("not-number")).toBeNull();
    expect(toFiniteNumber(undefined)).toBeNull();
  });

  it("toOptionalFiniteNumber wraps toFiniteNumber", () => {
    expect(toOptionalFiniteNumber("20")).toBe(20);
    expect(toOptionalFiniteNumber("abc")).toBeUndefined();
  });

  it("toBooleanLike supports multiple boolean-like values", () => {
    expect(toBooleanLike(true)).toBe(true);
    expect(toBooleanLike(false)).toBe(false);
    expect(toBooleanLike(1)).toBe(true);
    expect(toBooleanLike(0)).toBe(false);
    expect(toBooleanLike("yes")).toBe(true);
    expect(toBooleanLike("no")).toBe(false);
    expect(toBooleanLike("on")).toBe(true);
    expect(toBooleanLike("off")).toBe(false);
    expect(toBooleanLike("unknown")).toBeNull();
  });

  it("toOptionalBooleanLike returns undefined for unsupported values", () => {
    expect(toOptionalBooleanLike("true")).toBe(true);
    expect(toOptionalBooleanLike("false")).toBe(false);
    expect(toOptionalBooleanLike("maybe")).toBeUndefined();
  });

  it("clampNumber clamps out-of-range values", () => {
    expect(clampNumber(10, 0, 5)).toBe(5);
    expect(clampNumber(-10, 0, 5)).toBe(0);
    expect(clampNumber(3, 0, 5)).toBe(3);
  });

  it("readPathValue reads nested paths", () => {
    const source = {
      a: {
        b: {
          c: 123,
        },
      },
    };

    expect(readPathValue(source, "a.b.c")).toBe(123);
    expect(readPathValue(source, "a.b.missing")).toBeUndefined();
    expect(readPathValue(source, "")).toBeUndefined();
  });

  it("readFirstDefinedPath returns first existing path", () => {
    const source = {
      profile: {
        firstName: "Alice",
      },
      user: {
        name: "Bob",
      },
    };

    expect(readFirstDefinedPath(source, ["profile.firstName", "user.name"])).toBe("Alice");
    expect(readFirstDefinedPath(source, ["profile.missing", "user.name"])).toBe("Bob");
    expect(readFirstDefinedPath(source, ["x.y", "z.w"])).toBeUndefined();
  });

  it("readFirstStringPath returns first non-empty string", () => {
    const source = {
      one: "",
      two: "  ",
      three: "value",
      nested: {
        name: "nested-name",
      },
    };

    expect(readFirstStringPath(source, ["one", "two", "three"], "fallback")).toBe("value");
    expect(readFirstStringPath(source, ["nested.name"], "fallback")).toBe("nested-name");
    expect(readFirstStringPath(source, ["unknown"], "fallback")).toBe("fallback");
  });

  it("readFirstNumberPath returns first valid numeric value", () => {
    const source = {
      a: "x",
      b: "10.25",
      c: 20,
      nested: {
        amount: "42",
      },
    };

    expect(readFirstNumberPath(source, ["a", "b", "c"], 0)).toBe(10.25);
    expect(readFirstNumberPath(source, ["nested.amount"], 0)).toBe(42);
    expect(readFirstNumberPath(source, ["missing"], 99)).toBe(99);
  });

  it("readFirstBooleanPath returns first parseable boolean", () => {
    const source = {
      a: "unknown",
      b: "true",
      c: false,
      nested: {
        enabled: "off",
      },
    };

    expect(readFirstBooleanPath(source, ["a", "b"], false)).toBe(true);
    expect(readFirstBooleanPath(source, ["nested.enabled"], true)).toBe(false);
    expect(readFirstBooleanPath(source, ["missing"], true)).toBe(true);
  });

  it("ensureArray returns array or empty array", () => {
    expect(ensureArray<number>([1, 2, 3])).toEqual([1, 2, 3]);
    expect(ensureArray<number>(null)).toEqual([]);
    expect(ensureArray<number>({})).toEqual([]);
  });

  it("compactArray removes nullish values", () => {
    const result = compactArray([1, null, 2, undefined, 3]);
    expect(result).toEqual([1, 2, 3]);
  });

  it("compactObject removes nullish entries", () => {
    const result = compactObject({
      a: 1,
      b: undefined,
      c: null,
      d: "ok",
    });

    expect(result).toEqual({ a: 1, d: "ok" });
  });

  it("coerceRecord merges source over fallback for plain object", () => {
    const fallback = {
      a: 1,
      b: 2,
    };

    const result = coerceRecord(
      {
        b: 20,
        c: 30,
      },
      fallback,
    );

    expect(result).toEqual({ a: 1, b: 20, c: 30 });
  });

  it("coerceRecord returns fallback for non-object values", () => {
    const fallback = { a: 1 };
    expect(coerceRecord(null, fallback)).toEqual(fallback);
    expect(coerceRecord("text", fallback)).toEqual(fallback);
  });

  it("mapObjectValues transforms all object values", () => {
    const result = mapObjectValues(
      {
        a: 1,
        b: 2,
      },
      (value) => Number(value) * 10,
    );

    expect(result).toEqual({ a: 10, b: 20 });
  });

  it("deepMergeObjects merges nested structures without dropping base values", () => {
    const base = {
      profile: {
        name: "Alice",
        email: "alice@example.com",
      },
      stats: {
        points: 10,
      },
      topLevel: 1,
    };

    const override = {
      profile: {
        email: "alice+new@example.com",
      },
      stats: {
        points: 20,
      },
      topLevel: 2,
    };

    const result = deepMergeObjects(base, override);

    expect(result).toEqual({
      profile: {
        name: "Alice",
        email: "alice+new@example.com",
      },
      stats: {
        points: 20,
      },
      topLevel: 2,
    });
  });

  it("deepMergeObjects ignores undefined override values", () => {
    const base = {
      a: 1,
      nested: {
        enabled: true,
      },
    };

    const result = deepMergeObjects(base, {
      a: undefined,
      nested: {
        enabled: false,
      },
    });

    expect(result).toEqual({
      a: 1,
      nested: {
        enabled: false,
      },
    });
  });

  it("parseIsoDateSafe returns fallback for invalid values", () => {
    const fallback = "2026-01-01T00:00:00.000Z";
    expect(parseIsoDateSafe("invalid", fallback)).toBe(fallback);
    expect(parseIsoDateSafe(123, fallback)).toBe(fallback);
  });

  it("parseIsoDateSafe returns normalized ISO for valid values", () => {
    const result = parseIsoDateSafe("2026-02-01T10:30:00Z", "fallback");
    expect(result).toBe("2026-02-01T10:30:00.000Z");
  });

  it("compareStringsCaseInsensitive compares lexicographically", () => {
    expect(compareStringsCaseInsensitive("alpha", "beta")).toBeLessThan(0);
    expect(compareStringsCaseInsensitive("beta", "alpha")).toBeGreaterThan(0);
    expect(compareStringsCaseInsensitive("same", "same")).toBe(0);
  });

  it("sortByStringKey sorts by string field", () => {
    const result = sortByStringKey(
      [
        { id: 2, name: "Charlie" },
        { id: 1, name: "Alice" },
        { id: 3, name: "Bob" },
      ],
      "name",
    );

    expect(result.map((entry) => entry.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("withDefault returns fallback for nullish values", () => {
    expect(withDefault(undefined, "fallback")).toBe("fallback");
    expect(withDefault(null, "fallback")).toBe("fallback");
    expect(withDefault("value", "fallback")).toBe("value");
  });
});
