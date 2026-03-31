import { isNonEmptyString } from "@/lib/type-guards";

export type EnvKey = keyof ImportMetaEnv;

const envReadCache = new Map<string, string>();

export const normalizeEnvValue = (value: string | undefined | null): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/^['"]|['"]$/g, "");
};

const cacheKey = (primaryKey: EnvKey, secondaryKey?: EnvKey) => {
  return secondaryKey ? `${String(primaryKey)}::${String(secondaryKey)}` : String(primaryKey);
};

export const getEnvValue = (primaryKey: EnvKey, secondaryKey?: EnvKey): string => {
  const key = cacheKey(primaryKey, secondaryKey);
  const cached = envReadCache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const primaryRaw = import.meta.env[primaryKey];
  if (isNonEmptyString(primaryRaw)) {
    const normalizedPrimary = normalizeEnvValue(primaryRaw);
    envReadCache.set(key, normalizedPrimary);
    return normalizedPrimary;
  }

  if (secondaryKey) {
    const secondaryRaw = import.meta.env[secondaryKey];
    if (isNonEmptyString(secondaryRaw)) {
      const normalizedSecondary = normalizeEnvValue(secondaryRaw);
      envReadCache.set(key, normalizedSecondary);
      return normalizedSecondary;
    }
  }

  envReadCache.set(key, "");
  return "";
};

export const getEnvValueWithFallback = (
  primaryKey: EnvKey,
  secondaryKey: EnvKey | undefined,
  fallback: string,
): string => {
  const value = getEnvValue(primaryKey, secondaryKey);
  return value || fallback;
};

export const parseEnvNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const parseEnvInteger = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
};

export const readEnvUrl = (value: string | undefined, fallback: string): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
};

export const parseChainId = (value: string | undefined, fallback: number): number => {
  return parseEnvInteger(value, fallback);
};

export const clearEnvCache = () => {
  envReadCache.clear();
};
