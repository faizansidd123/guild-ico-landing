export type JsonRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is JsonRecord => {
  return typeof value === "object" && value !== null;
};

export const asRecord = (value: unknown): JsonRecord => {
  if (isRecord(value)) {
    return value;
  }
  return {};
};

export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

export const readString = (record: JsonRecord, keys: string[], fallback = ""): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return fallback;
};

export const readRecord = (record: JsonRecord, keys: string[]): JsonRecord | null => {
  for (const key of keys) {
    const value = record[key];
    if (isRecord(value)) {
      return value;
    }
  }
  return null;
};

export const readArray = <T = unknown>(record: JsonRecord, keys: string[]): T[] => {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }
  return [];
};

export const readStringArray = (record: JsonRecord, keys: string[]): string[] => {
  const values = readArray<string>(record, keys);
  return values.filter((value) => typeof value === "string");
};

export const pickDefined = <T extends JsonRecord>(record: T): Partial<T> => {
  return Object.entries(record).reduce<Partial<T>>((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value as T[keyof T];
    }
    return acc;
  }, {});
};

export const toLowerTrimmed = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
};

export const toUpperTrimmed = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toUpperCase();
};
