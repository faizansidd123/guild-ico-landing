import { JsonRecord } from "@/lib/type-guards";

export const MIN_NON_ZERO = 0.000001;

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

export const toPositiveInteger = (value: unknown, fallback = 1): number => {
  const normalized = toFiniteNumber(value);
  if (normalized === null) {
    return fallback;
  }

  const integer = Math.trunc(normalized);
  if (integer > 0) {
    return integer;
  }

  return fallback;
};

export const clamp = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
};

export const clampPercentage = (value: number): number => {
  return clamp(value, 0, 100);
};

export const readNumber = (record: JsonRecord, keys: string[], fallback: number): number => {
  for (const key of keys) {
    const parsed = toFiniteNumber(record[key]);
    if (parsed !== null) {
      return parsed;
    }
  }
  return fallback;
};

export const toBoolean = (value: unknown): boolean | null => {
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
    if (["true", "1", "yes"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no"].includes(normalized)) {
      return false;
    }
  }

  return null;
};

export const readBoolean = (record: JsonRecord, keys: string[], fallback: boolean): boolean => {
  for (const key of keys) {
    const parsed = toBoolean(record[key]);
    if (parsed !== null) {
      return parsed;
    }
  }
  return fallback;
};

export const roundTo = (value: number, precision: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const safePrecision = Math.max(0, Math.trunc(precision));
  const factor = 10 ** safePrecision;
  return Math.round(value * factor) / factor;
};

export const safeDivide = (numerator: number, denominator: number, fallback = 0): number => {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return fallback;
  }
  return numerator / denominator;
};
