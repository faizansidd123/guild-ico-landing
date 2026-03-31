export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const nowMs = (): number => Date.now();

export const toUnixMs = (value: Date | string | number): number | null => {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const toIsoSafe = (value: Date | string | number, fallback: string): string => {
  const timestamp = toUnixMs(value);
  if (timestamp === null) {
    return fallback;
  }

  return new Date(timestamp).toISOString();
};

export const msUntil = (target: Date | string | number, now = nowMs()): number => {
  const targetMs = toUnixMs(target);
  if (targetMs === null) {
    return 0;
  }

  return Math.max(0, targetMs - now);
};

export const secondsUntil = (target: Date | string | number, now = nowMs()): number => {
  return Math.floor(msUntil(target, now) / SECOND_MS);
};

export const isExpired = (target: Date | string | number, now = nowMs()): boolean => {
  const targetMs = toUnixMs(target);
  if (targetMs === null) {
    return true;
  }

  return targetMs <= now;
};

export const hasStarted = (target: Date | string | number, now = nowMs()): boolean => {
  const targetMs = toUnixMs(target);
  if (targetMs === null) {
    return false;
  }

  return targetMs <= now;
};

export const formatDurationParts = (durationMs: number): CountdownParts => {
  const safeDuration = Math.max(0, Math.trunc(durationMs));

  const days = Math.floor(safeDuration / DAY_MS);
  const afterDays = safeDuration % DAY_MS;

  const hours = Math.floor(afterDays / HOUR_MS);
  const afterHours = afterDays % HOUR_MS;

  const minutes = Math.floor(afterHours / MINUTE_MS);
  const afterMinutes = afterHours % MINUTE_MS;

  const seconds = Math.floor(afterMinutes / SECOND_MS);

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: safeDuration,
  };
};

export const buildCountdown = (target: Date | string | number, now = nowMs()): CountdownParts => {
  return formatDurationParts(msUntil(target, now));
};

export const pad2 = (value: number): string => {
  return String(Math.max(0, Math.trunc(value))).padStart(2, "0");
};

export const formatCountdown = (parts: CountdownParts): string => {
  return `${pad2(parts.days)}:${pad2(parts.hours)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`;
};

export const addMs = (value: Date | string | number, deltaMs: number): number | null => {
  const timestamp = toUnixMs(value);
  if (timestamp === null) {
    return null;
  }

  if (!Number.isFinite(deltaMs)) {
    return timestamp;
  }

  return timestamp + deltaMs;
};

export const addSeconds = (value: Date | string | number, deltaSeconds: number): number | null => {
  return addMs(value, deltaSeconds * SECOND_MS);
};

export const addMinutes = (value: Date | string | number, deltaMinutes: number): number | null => {
  return addMs(value, deltaMinutes * MINUTE_MS);
};

export const addHours = (value: Date | string | number, deltaHours: number): number | null => {
  return addMs(value, deltaHours * HOUR_MS);
};

export const addDays = (value: Date | string | number, deltaDays: number): number | null => {
  return addMs(value, deltaDays * DAY_MS);
};

export const startOfDayUtc = (value: Date | string | number): number | null => {
  const timestamp = toUnixMs(value);
  if (timestamp === null) {
    return null;
  }

  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
};

export const endOfDayUtc = (value: Date | string | number): number | null => {
  const start = startOfDayUtc(value);
  if (start === null) {
    return null;
  }

  return start + DAY_MS - 1;
};

export const diffInDays = (left: Date | string | number, right: Date | string | number): number => {
  const leftMs = toUnixMs(left);
  const rightMs = toUnixMs(right);

  if (leftMs === null || rightMs === null) {
    return 0;
  }

  return Math.floor((leftMs - rightMs) / DAY_MS);
};

export const diffInHours = (left: Date | string | number, right: Date | string | number): number => {
  const leftMs = toUnixMs(left);
  const rightMs = toUnixMs(right);

  if (leftMs === null || rightMs === null) {
    return 0;
  }

  return Math.floor((leftMs - rightMs) / HOUR_MS);
};

export const diffInMinutes = (left: Date | string | number, right: Date | string | number): number => {
  const leftMs = toUnixMs(left);
  const rightMs = toUnixMs(right);

  if (leftMs === null || rightMs === null) {
    return 0;
  }

  return Math.floor((leftMs - rightMs) / MINUTE_MS);
};

export const diffInSeconds = (left: Date | string | number, right: Date | string | number): number => {
  const leftMs = toUnixMs(left);
  const rightMs = toUnixMs(right);

  if (leftMs === null || rightMs === null) {
    return 0;
  }

  return Math.floor((leftMs - rightMs) / SECOND_MS);
};
