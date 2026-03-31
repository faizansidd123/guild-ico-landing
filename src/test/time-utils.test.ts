import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  addDays,
  addHours,
  addMinutes,
  addMs,
  addSeconds,
  buildCountdown,
  diffInDays,
  diffInHours,
  diffInMinutes,
  diffInSeconds,
  endOfDayUtc,
  formatCountdown,
  formatDurationParts,
  hasStarted,
  isExpired,
  msUntil,
  nowMs,
  pad2,
  secondsUntil,
  startOfDayUtc,
  toIsoSafe,
  toUnixMs,
} from "@/lib/time-utils";

describe("time-utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  it("nowMs reflects current system time", () => {
    expect(nowMs()).toBe(new Date("2026-01-01T00:00:00.000Z").getTime());
  });

  it("toUnixMs converts Date values", () => {
    const value = toUnixMs(new Date("2026-01-01T01:00:00.000Z"));
    expect(value).toBe(new Date("2026-01-01T01:00:00.000Z").getTime());
  });

  it("toUnixMs returns number values as-is when finite", () => {
    expect(toUnixMs(12345)).toBe(12345);
    expect(toUnixMs(Number.NaN)).toBeNull();
  });

  it("toUnixMs parses ISO string values", () => {
    expect(toUnixMs("2026-01-01T02:00:00.000Z")).toBe(new Date("2026-01-01T02:00:00.000Z").getTime());
    expect(toUnixMs("not-a-date")).toBeNull();
  });

  it("toIsoSafe normalizes valid values", () => {
    expect(toIsoSafe("2026-01-01T02:30:00Z", "fallback")).toBe("2026-01-01T02:30:00.000Z");
    expect(toIsoSafe("invalid", "fallback")).toBe("fallback");
  });

  it("msUntil returns remaining milliseconds", () => {
    expect(msUntil("2026-01-01T00:00:10.000Z")).toBe(10_000);
    expect(msUntil("2025-12-31T23:59:59.000Z")).toBe(0);
  });

  it("secondsUntil returns floored seconds", () => {
    expect(secondsUntil("2026-01-01T00:00:10.900Z")).toBe(10);
    expect(secondsUntil("2025-12-31T23:59:59.000Z")).toBe(0);
  });

  it("isExpired returns true for past and invalid dates", () => {
    expect(isExpired("2025-12-31T23:59:59.000Z")).toBe(true);
    expect(isExpired("not-a-date")).toBe(true);
    expect(isExpired("2026-01-01T00:00:01.000Z")).toBe(false);
  });

  it("hasStarted returns false for invalid and future dates", () => {
    expect(hasStarted("not-a-date")).toBe(false);
    expect(hasStarted("2026-01-01T00:00:01.000Z")).toBe(false);
    expect(hasStarted("2025-12-31T23:59:59.000Z")).toBe(true);
  });

  it("formatDurationParts breaks down duration into day/hour/minute/second", () => {
    const parts = formatDurationParts(
      2 * 24 * 60 * 60 * 1000 +
        3 * 60 * 60 * 1000 +
        4 * 60 * 1000 +
        5 * 1000 +
        999,
    );

    expect(parts.days).toBe(2);
    expect(parts.hours).toBe(3);
    expect(parts.minutes).toBe(4);
    expect(parts.seconds).toBe(5);
  });

  it("formatDurationParts clamps negative values to zero", () => {
    const parts = formatDurationParts(-100);
    expect(parts.days).toBe(0);
    expect(parts.hours).toBe(0);
    expect(parts.minutes).toBe(0);
    expect(parts.seconds).toBe(0);
    expect(parts.totalMs).toBe(0);
  });

  it("buildCountdown composes msUntil and formatDurationParts", () => {
    const parts = buildCountdown("2026-01-02T01:02:03.000Z");

    expect(parts.days).toBe(1);
    expect(parts.hours).toBe(1);
    expect(parts.minutes).toBe(2);
    expect(parts.seconds).toBe(3);
  });

  it("pad2 formats numbers to at least 2 digits", () => {
    expect(pad2(0)).toBe("00");
    expect(pad2(5)).toBe("05");
    expect(pad2(12)).toBe("12");
    expect(pad2(-5)).toBe("00");
  });

  it("formatCountdown renders padded countdown", () => {
    const text = formatCountdown({
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
      totalMs: 0,
    });

    expect(text).toBe("01:02:03:04");
  });

  it("addMs adds milliseconds to valid values", () => {
    const result = addMs("2026-01-01T00:00:00.000Z", 1000);
    expect(result).toBe(new Date("2026-01-01T00:00:01.000Z").getTime());
  });

  it("addMs returns original timestamp when delta is invalid", () => {
    const result = addMs("2026-01-01T00:00:00.000Z", Number.NaN);
    expect(result).toBe(new Date("2026-01-01T00:00:00.000Z").getTime());
  });

  it("addMs returns null for invalid dates", () => {
    expect(addMs("invalid", 1000)).toBeNull();
  });

  it("addSeconds adds second deltas", () => {
    const result = addSeconds("2026-01-01T00:00:00.000Z", 30);
    expect(result).toBe(new Date("2026-01-01T00:00:30.000Z").getTime());
  });

  it("addMinutes adds minute deltas", () => {
    const result = addMinutes("2026-01-01T00:00:00.000Z", 15);
    expect(result).toBe(new Date("2026-01-01T00:15:00.000Z").getTime());
  });

  it("addHours adds hour deltas", () => {
    const result = addHours("2026-01-01T00:00:00.000Z", 2);
    expect(result).toBe(new Date("2026-01-01T02:00:00.000Z").getTime());
  });

  it("addDays adds day deltas", () => {
    const result = addDays("2026-01-01T00:00:00.000Z", 3);
    expect(result).toBe(new Date("2026-01-04T00:00:00.000Z").getTime());
  });

  it("startOfDayUtc returns midnight timestamp", () => {
    const result = startOfDayUtc("2026-03-10T14:20:30.000Z");
    expect(result).toBe(new Date("2026-03-10T00:00:00.000Z").getTime());
  });

  it("endOfDayUtc returns day end timestamp", () => {
    const result = endOfDayUtc("2026-03-10T14:20:30.000Z");
    expect(result).toBe(new Date("2026-03-10T23:59:59.999Z").getTime());
  });

  it("startOfDayUtc and endOfDayUtc return null for invalid values", () => {
    expect(startOfDayUtc("invalid")).toBeNull();
    expect(endOfDayUtc("invalid")).toBeNull();
  });

  it("diffInDays returns floored day difference", () => {
    expect(diffInDays("2026-01-10T00:00:00.000Z", "2026-01-01T00:00:00.000Z")).toBe(9);
    expect(diffInDays("2026-01-01T00:00:00.000Z", "2026-01-10T00:00:00.000Z")).toBe(-9);
  });

  it("diffInHours returns floored hour difference", () => {
    expect(diffInHours("2026-01-01T10:00:00.000Z", "2026-01-01T02:00:00.000Z")).toBe(8);
    expect(diffInHours("2026-01-01T02:00:00.000Z", "2026-01-01T10:00:00.000Z")).toBe(-8);
  });

  it("diffInMinutes returns floored minute difference", () => {
    expect(diffInMinutes("2026-01-01T00:30:00.000Z", "2026-01-01T00:00:00.000Z")).toBe(30);
    expect(diffInMinutes("2026-01-01T00:00:00.000Z", "2026-01-01T00:30:00.000Z")).toBe(-30);
  });

  it("diffInSeconds returns floored second difference", () => {
    expect(diffInSeconds("2026-01-01T00:00:30.000Z", "2026-01-01T00:00:00.000Z")).toBe(30);
    expect(diffInSeconds("2026-01-01T00:00:00.000Z", "2026-01-01T00:00:30.000Z")).toBe(-30);
  });

  it("diff functions return zero for invalid values", () => {
    expect(diffInDays("invalid", "2026-01-01T00:00:00.000Z")).toBe(0);
    expect(diffInHours("invalid", "2026-01-01T00:00:00.000Z")).toBe(0);
    expect(diffInMinutes("invalid", "2026-01-01T00:00:00.000Z")).toBe(0);
    expect(diffInSeconds("invalid", "2026-01-01T00:00:00.000Z")).toBe(0);
  });

  it("integration scenario: countdown reaches zero over time", () => {
    const target = "2026-01-01T00:00:05.000Z";

    const first = buildCountdown(target);
    expect(first.seconds).toBe(5);

    vi.advanceTimersByTime(3000);
    const second = buildCountdown(target);
    expect(second.seconds).toBe(2);

    vi.advanceTimersByTime(5000);
    const third = buildCountdown(target);
    expect(third.totalMs).toBe(0);
    expect(formatCountdown(third)).toBe("00:00:00:00");
  });
});
