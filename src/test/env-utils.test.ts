import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearEnvValuesForTests,
  clearEnvCache,
  getEnvValue,
  getEnvValueWithFallback,
  normalizeEnvValue,
  parseChainId,
  parseEnvInteger,
  parseEnvNumber,
  readEnvUrl,
  setEnvValueForTests,
} from "@/lib/env-utils";

const withEnv = (key: string, value: string | undefined) => {
  setEnvValueForTests(key, value);
};

describe("env-utils", () => {
  const keys = [
    "NEXT_PUBLIC_CUSTOM_A",
    "VITE_CUSTOM_A",
    "NEXT_PUBLIC_CUSTOM_B",
    "VITE_CUSTOM_B",
    "NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN",
    "VITE_TOKEN_CONTRACT_CHAIN",
  ];

  beforeEach(() => {
    clearEnvValuesForTests();
    clearEnvCache();
    keys.forEach((key) => withEnv(key, undefined));
  });

  afterEach(() => {
    clearEnvValuesForTests();
    clearEnvCache();
  });

  it("normalizeEnvValue trims whitespace and wrapping quotes", () => {
    expect(normalizeEnvValue("   hello   ")).toBe("hello");
    expect(normalizeEnvValue("  'hello'  ")).toBe("hello");
    expect(normalizeEnvValue('  "hello"  ')).toBe("hello");
    expect(normalizeEnvValue(undefined)).toBe("");
    expect(normalizeEnvValue(null)).toBe("");
  });

  it("reads primary env key before secondary", () => {
    withEnv("NEXT_PUBLIC_CUSTOM_A", " primary-value ");
    withEnv("VITE_CUSTOM_A", "secondary-value");

    const value = getEnvValue(
      "NEXT_PUBLIC_CUSTOM_A" as keyof ImportMetaEnv,
      "VITE_CUSTOM_A" as keyof ImportMetaEnv,
    );

    expect(value).toBe("primary-value");
  });

  it("falls back to secondary key when primary is missing", () => {
    withEnv("NEXT_PUBLIC_CUSTOM_A", undefined);
    withEnv("VITE_CUSTOM_A", " secondary-value ");

    const value = getEnvValue(
      "NEXT_PUBLIC_CUSTOM_A" as keyof ImportMetaEnv,
      "VITE_CUSTOM_A" as keyof ImportMetaEnv,
    );

    expect(value).toBe("secondary-value");
  });

  it("returns empty string when neither key exists", () => {
    const value = getEnvValue(
      "NEXT_PUBLIC_CUSTOM_A" as keyof ImportMetaEnv,
      "VITE_CUSTOM_A" as keyof ImportMetaEnv,
    );

    expect(value).toBe("");
  });

  it("returns fallback value when env value is blank", () => {
    withEnv("NEXT_PUBLIC_CUSTOM_A", "   ");

    const value = getEnvValueWithFallback(
      "NEXT_PUBLIC_CUSTOM_A" as keyof ImportMetaEnv,
      "VITE_CUSTOM_A" as keyof ImportMetaEnv,
      "fallback-value",
    );

    expect(value).toBe("fallback-value");
  });

  it("uses cached result until cache is cleared", () => {
    withEnv("NEXT_PUBLIC_CUSTOM_A", "first");

    const first = getEnvValue(
      "NEXT_PUBLIC_CUSTOM_A" as keyof ImportMetaEnv,
      "VITE_CUSTOM_A" as keyof ImportMetaEnv,
    );

    withEnv("NEXT_PUBLIC_CUSTOM_A", "second");

    const second = getEnvValue(
      "NEXT_PUBLIC_CUSTOM_A" as keyof ImportMetaEnv,
      "VITE_CUSTOM_A" as keyof ImportMetaEnv,
    );

    expect(first).toBe("first");
    expect(second).toBe("first");

    clearEnvCache();

    const third = getEnvValue(
      "NEXT_PUBLIC_CUSTOM_A" as keyof ImportMetaEnv,
      "VITE_CUSTOM_A" as keyof ImportMetaEnv,
    );

    expect(third).toBe("second");
  });

  it("parseEnvNumber returns fallback for invalid values", () => {
    expect(parseEnvNumber("123.45", 0)).toBe(123.45);
    expect(parseEnvNumber("0", 99)).toBe(0);
    expect(parseEnvNumber("abc", 99)).toBe(99);
    expect(parseEnvNumber(undefined, 99)).toBe(99);
  });

  it("parseEnvInteger accepts only positive integers", () => {
    expect(parseEnvInteger("1", 99)).toBe(1);
    expect(parseEnvInteger("8453", 1)).toBe(8453);
    expect(parseEnvInteger("0", 7)).toBe(7);
    expect(parseEnvInteger("-1", 7)).toBe(7);
    expect(parseEnvInteger("2.1", 7)).toBe(7);
    expect(parseEnvInteger(undefined, 7)).toBe(7);
  });

  it("readEnvUrl falls back for empty values", () => {
    expect(readEnvUrl("https://example.com", "fallback")).toBe("https://example.com");
    expect(readEnvUrl("   ", "fallback")).toBe("fallback");
    expect(readEnvUrl(undefined, "fallback")).toBe("fallback");
  });

  it("parseChainId uses integer parser semantics", () => {
    expect(parseChainId("8453", 1)).toBe(8453);
    expect(parseChainId("1", 8453)).toBe(1);
    expect(parseChainId("", 8453)).toBe(8453);
    expect(parseChainId(undefined, 8453)).toBe(8453);
    expect(parseChainId("-10", 8453)).toBe(8453);
  });

  it("supports primary-only lookups", () => {
    withEnv("NEXT_PUBLIC_CUSTOM_B", "single-value");

    const value = getEnvValue("NEXT_PUBLIC_CUSTOM_B" as keyof ImportMetaEnv);

    expect(value).toBe("single-value");
  });

  it("normalizes quoted primary and secondary values", () => {
    withEnv("NEXT_PUBLIC_CUSTOM_B", " 'quoted-primary' ");
    withEnv("VITE_CUSTOM_B", ' "quoted-secondary" ');

    const primary = getEnvValue(
      "NEXT_PUBLIC_CUSTOM_B" as keyof ImportMetaEnv,
      "VITE_CUSTOM_B" as keyof ImportMetaEnv,
    );
    clearEnvCache();

    withEnv("NEXT_PUBLIC_CUSTOM_B", undefined);

    const secondary = getEnvValue(
      "NEXT_PUBLIC_CUSTOM_B" as keyof ImportMetaEnv,
      "VITE_CUSTOM_B" as keyof ImportMetaEnv,
    );

    expect(primary).toBe("quoted-primary");
    expect(secondary).toBe("quoted-secondary");
  });

  it("parses chain id from configured keys", () => {
    withEnv("NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN", "8453");
    withEnv("VITE_TOKEN_CONTRACT_CHAIN", "11155111");

    const value = getEnvValue(
      "NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN" as keyof ImportMetaEnv,
      "VITE_TOKEN_CONTRACT_CHAIN" as keyof ImportMetaEnv,
    );

    expect(parseChainId(value, 1)).toBe(8453);

    clearEnvCache();
    withEnv("NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN", undefined);

    const fallbackValue = getEnvValue(
      "NEXT_PUBLIC_TOKEN_CONTRACT_CHAIN" as keyof ImportMetaEnv,
      "VITE_TOKEN_CONTRACT_CHAIN" as keyof ImportMetaEnv,
    );

    expect(parseChainId(fallbackValue, 1)).toBe(11155111);
  });
});
