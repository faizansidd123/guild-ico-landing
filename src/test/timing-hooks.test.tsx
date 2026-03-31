import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildCountdown, useCountdown } from "@/hooks/use-countdown";
import { useDebouncedNumber } from "@/hooks/use-debounced-number";

const CountdownHarness = ({ endIso }: { endIso: string | null }) => {
  const countdown = useCountdown(endIso, 1000);
  return (
    <div>
      <span data-testid="days">{countdown?.d ?? -1}</span>
      <span data-testid="hours">{countdown?.h ?? -1}</span>
      <span data-testid="minutes">{countdown?.m ?? -1}</span>
      <span data-testid="seconds">{countdown?.s ?? -1}</span>
      <span data-testid="total">{countdown?.total ?? -1}</span>
    </div>
  );
};

const DebouncedHarness = ({ value, delayMs }: { value: number; delayMs: number }) => {
  const debounced = useDebouncedNumber(value, delayMs);
  return <span data-testid="debounced">{debounced}</span>;
};

describe("timing hooks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("buildCountdown calculates day/hour/minute/second buckets", () => {
    const countdown = buildCountdown("2026-01-02T01:02:03Z");
    expect(countdown.d).toBe(1);
    expect(countdown.h).toBe(1);
    expect(countdown.m).toBe(2);
    expect(countdown.s).toBe(3);
    expect(countdown.total).toBeGreaterThan(0);
  });

  it("buildCountdown floors negative values to zero", () => {
    const countdown = buildCountdown("2025-12-31T23:59:59Z");
    expect(countdown.total).toBe(0);
    expect(countdown.d).toBe(0);
    expect(countdown.h).toBe(0);
    expect(countdown.m).toBe(0);
    expect(countdown.s).toBe(0);
  });

  it("useCountdown returns null when endIso is null", () => {
    render(<CountdownHarness endIso={null} />);
    expect(screen.getByTestId("total")).toHaveTextContent("-1");
  });

  it("useCountdown updates countdown as time advances", () => {
    render(<CountdownHarness endIso="2026-01-01T00:00:10Z" />);
    expect(screen.getByTestId("seconds")).toHaveTextContent("10");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId("seconds")).toHaveTextContent("7");
  });

  it("useDebouncedNumber lags updates by delay", () => {
    const { rerender } = render(<DebouncedHarness value={1} delayMs={250} />);
    expect(screen.getByTestId("debounced")).toHaveTextContent("1");

    rerender(<DebouncedHarness value={42} delayMs={250} />);
    expect(screen.getByTestId("debounced")).toHaveTextContent("1");

    act(() => {
      vi.advanceTimersByTime(249);
    });
    expect(screen.getByTestId("debounced")).toHaveTextContent("1");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId("debounced")).toHaveTextContent("42");
  });
});
