import { describe, expect, it } from "vitest";

import {
  dateTimeFormatter,
  numberFormatter,
  tokenFormatter,
  usdFormatter,
  usdValueFormatter,
} from "@/lib/formatters";

describe("formatters", () => {
  it("formats integers with grouping separators", () => {
    const formatted = numberFormatter.format(1234567);
    expect(formatted).toContain("1");
    expect(formatted.length).toBeGreaterThan(4);
  });

  it("formats token values with max two decimals", () => {
    const formatted = tokenFormatter.format(1234.56789);
    expect(formatted).toContain("1");
    expect(formatted.includes("567")).toBe(false);
  });

  it("formats USD whole values", () => {
    const formatted = usdFormatter.format(1700000);
    expect(formatted).toContain("$");
    expect(formatted).toContain("1");
  });

  it("formats USD values with cents", () => {
    const formatted = usdValueFormatter.format(1234.5);
    expect(formatted).toContain("$");
    expect(formatted).toContain("1");
  });

  it("formats date and time together", () => {
    const formatted = dateTimeFormatter.format(new Date("2026-03-18T12:30:00Z"));
    expect(formatted.length).toBeGreaterThan(5);
  });
});
