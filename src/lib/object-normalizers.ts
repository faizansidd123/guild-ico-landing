export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonRecord | JsonValue[];
export type JsonRecord = Record<string, JsonValue | undefined>;

export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Object.prototype.toString.call(value) === "[object Object]";
};

export const asPlainObject = (value: unknown): Record<string, unknown> => {
  if (isPlainObject(value)) {
    return value;
  }

  return {};
};

export const normalizeString = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

export const normalizeStringLower = (value: unknown): string => {
  return normalizeString(value).toLowerCase();
};

export const normalizeStringUpper = (value: unknown): string => {
  return normalizeString(value).toUpperCase();
};

export const toOptionalString = (value: unknown): string | undefined => {
  const normalized = normalizeString(value);
  return normalized.length > 0 ? normalized : undefined;
};

export const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

export const toOptionalFiniteNumber = (value: unknown): number | undefined => {
  const normalized = toFiniteNumber(value);
  return normalized === null ? undefined : normalized;
};

export const toBooleanLike = (value: unknown): boolean | null => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "n", "off"].includes(normalized)) {
      return false;
    }
  }

  return null;
};

export const toOptionalBooleanLike = (value: unknown): boolean | undefined => {
  const normalized = toBooleanLike(value);
  return normalized === null ? undefined : normalized;
};

export const clampNumber = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
};

const splitPath = (path: string): string[] => {
  return path
    .split(".")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
};

export const readPathValue = (source: unknown, path: string): unknown => {
  const keys = splitPath(path);
  if (keys.length === 0) {
    return undefined;
  }

  let cursor: unknown = source;

  for (const key of keys) {
    if (!isPlainObject(cursor)) {
      return undefined;
    }

    cursor = (cursor as Record<string, unknown>)[key];
  }

  return cursor;
};

export const readFirstDefinedPath = (source: unknown, paths: string[]): unknown => {
  for (const path of paths) {
    const value = readPathValue(source, path);
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

export const readFirstStringPath = (source: unknown, paths: string[], fallback = ""): string => {
  for (const path of paths) {
    const value = readPathValue(source, path);
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return fallback;
};

export const readFirstNumberPath = (source: unknown, paths: string[], fallback: number): number => {
  for (const path of paths) {
    const value = readPathValue(source, path);
    const parsed = toFiniteNumber(value);
    if (parsed !== null) {
      return parsed;
    }
  }

  return fallback;
};

export const readFirstBooleanPath = (source: unknown, paths: string[], fallback: boolean): boolean => {
  for (const path of paths) {
    const value = readPathValue(source, path);
    const parsed = toBooleanLike(value);
    if (parsed !== null) {
      return parsed;
    }
  }

  return fallback;
};

export const ensureArray = <T>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

export const compactArray = <T>(value: Array<T | null | undefined>): T[] => {
  return value.filter((item): item is T => item !== null && item !== undefined);
};

export const compactObject = <T extends Record<string, unknown>>(source: T): Partial<T> => {
  return Object.entries(source).reduce<Partial<T>>((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key as keyof T] = value as T[keyof T];
    }

    return acc;
  }, {});
};

export const coerceRecord = <T extends Record<string, unknown>>(source: unknown, fallback: T): T => {
  if (isPlainObject(source)) {
    return {
      ...fallback,
      ...(source as T),
    };
  }

  return fallback;
};

export const mapObjectValues = <T extends Record<string, unknown>, R>(
  source: T,
  mapper: (value: T[keyof T], key: keyof T) => R,
): Record<keyof T, R> => {
  const entries = Object.entries(source).map(([key, value]) => {
    const typedKey = key as keyof T;
    return [typedKey, mapper(value as T[keyof T], typedKey)] as const;
  });

  return Object.fromEntries(entries) as Record<keyof T, R>;
};

export const deepMergeObjects = <T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>,
): T => {
  const result: Record<string, unknown> = { ...base };

  Object.entries(override).forEach(([key, overrideValue]) => {
    const baseValue = result[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMergeObjects(baseValue, overrideValue);
      return;
    }

    if (overrideValue !== undefined) {
      result[key] = overrideValue;
    }
  });

  return result as T;
};

export const parseIsoDateSafe = (value: unknown, fallback: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return fallback;
  }

  return new Date(timestamp).toISOString();
};

export const compareStringsCaseInsensitive = (a: string, b: string): number => {
  return a.localeCompare(b, undefined, { sensitivity: "accent" });
};

export const sortByStringKey = <T extends Record<string, unknown>>(
  list: T[],
  key: keyof T,
): T[] => {
  return [...list].sort((left, right) => {
    const leftValue = typeof left[key] === "string" ? (left[key] as string) : "";
    const rightValue = typeof right[key] === "string" ? (right[key] as string) : "";

    return compareStringsCaseInsensitive(leftValue, rightValue);
  });
};

export const withDefault = <T>(value: T | undefined | null, fallback: T): T => {
  return value === undefined || value === null ? fallback : value;
};
