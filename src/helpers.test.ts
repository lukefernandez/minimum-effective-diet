import { describe, it, expect } from "vitest";

import { formatNumber, range } from "./helpers";

describe("range", () => {
  it("generates correct range with integer steps", () => {
    expect(range(1, 5, 1)).toEqual([1, 2, 3, 4, 5]);
  });

  it("generates correct range with decimal steps", () => {
    expect(range(0, 1, 0.2)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
  });

  it("handles floating-point precision", () => {
    expect(range(0, 1, 0.1)).toHaveLength(11);
    expect(range(0, 1, 0.1)[10]).toBeCloseTo(1, 10);
  });

  it("returns empty array when start is greater than end", () => {
    expect(range(5, 1, 1)).toEqual([]);
  });

  it("handles negative numbers", () => {
    expect(range(-5, -1, 1)).toEqual([-5, -4, -3, -2, -1]);
  });

  it("handles single-element range", () => {
    expect(range(1, 1, 1)).toEqual([1]);
  });
});

describe("formatNumber", () => {
  it("rounds to the nearest whole number", () => {
    expect(formatNumber(105.28)).toBe("105");
    expect(formatNumber(87.5)).toBe("88");
  });

  it("adds thousands separators", () => {
    expect(formatNumber(1962.5)).toBe("1,963");
    expect(formatNumber(2563)).toBe("2,563");
  });

  it("returns an empty string for null and NaN", () => {
    expect(formatNumber(null)).toBe("");
    expect(formatNumber(NaN)).toBe("");
  });

  it("never renders negative zero", () => {
    expect(formatNumber(-0.4)).toBe("0");
    expect(formatNumber(-0)).toBe("0");
  });
});
