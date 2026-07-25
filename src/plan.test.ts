import { describe, it, expect } from "vitest";

import {
  computeDayMacros,
  computePlan,
  getMaintenanceCalories,
  IntensityLevel,
  MIN_FAT_GRAMS_PER_POUND,
  PlanDirection,
} from "./plan";

describe("getMaintenanceCalories", () => {
  it("returns correct calories for valid weight and intensity", () => {
    expect(getMaintenanceCalories(120, "light")).toBe(1700);
    expect(getMaintenanceCalories(180, "moderate")).toBe(2500);
    expect(getMaintenanceCalories(250, "hard")).toBe(3300);
  });

  it("returns null for weight below 100", () => {
    expect(getMaintenanceCalories(99, "light")).toBeNull();
    expect(getMaintenanceCalories(50, "light")).toBeNull();
    expect(getMaintenanceCalories(-10, "light")).toBeNull();
    expect(getMaintenanceCalories(10.5, "light")).toBeNull();
  });

  it("returns null for weight above 300", () => {
    expect(getMaintenanceCalories(301, "moderate")).toBeNull();
  });

  it("returns correct calories for boundary weights", () => {
    expect(getMaintenanceCalories(100, "non-training")).toBe(1300);
    expect(getMaintenanceCalories(300, "hard")).toBe(3900);
  });

  it("returns null for invalid intensity", () => {
    expect(
      getMaintenanceCalories(150, "Invalid Intensity" as IntensityLevel),
    ).toBeNull();
  });

  it("returns correct calories for maximum weight in each range", () => {
    expect(getMaintenanceCalories(115, "moderate")).toBe(1700);
    expect(getMaintenanceCalories(130, "hard")).toBe(2100);
    expect(getMaintenanceCalories(145, "light")).toBe(1900);
  });
});

describe("computeDayMacros", () => {
  // 140 lb, gain 0.375%/week: surplus 262.5 cal/day, protein 161.875g
  const surplusCase = {
    calories: 1700 + 262.5,
    protein: 140 + 262.5 / 12,
    carbs: 70 + 262.5 / 12,
    fatFloor: 140 * MIN_FAT_GRAMS_PER_POUND,
  };

  it("leaves macros untouched when fat is above the floor", () => {
    const { carbs, fat } = computeDayMacros(
      surplusCase.calories,
      surplusCase.protein,
      surplusCase.carbs,
      surplusCase.fatFloor,
    );
    expect(carbs).toBeCloseTo(91.875, 10);
    expect(fat).toBeCloseTo(947.5 / 9, 10);
  });

  it("floors fat and takes the difference from carbs", () => {
    // 250 lb, lose 0.75%/week, hard day: even-split fat would be negative
    const calories = 3300 - 937.5;
    const protein = 250 - 937.5 / 12;
    const carbs = 500 - 937.5 / 12;
    const floor = 250 * MIN_FAT_GRAMS_PER_POUND;
    const result = computeDayMacros(calories, protein, carbs, floor);
    expect(result.fat).toBe(floor);
    expect(result.carbs).toBeLessThan(carbs);
    expect(result.carbs).toBeGreaterThan(0);
  });

  it("zeroes carbs rather than overdrawing them when the floor doesn't fit", () => {
    // 300 lb, lose 0.9%/week, rest day: protein + fat floor exceed calories
    const calories = 2700 - 1350;
    const protein = 300 - 1350 / 12;
    const carbs = 150 - 1350 / 12;
    const floor = 300 * MIN_FAT_GRAMS_PER_POUND;
    const result = computeDayMacros(calories, protein, carbs, floor);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBeCloseTo((calories - protein * 4) / 9, 10);
  });

  it("keeps macros summing to calories in every branch", () => {
    for (const [calories, protein, carbs, floor] of [
      [1962.5, 161.875, 91.875, 42],
      [2362.5, 171.875, 421.875, 75],
      [1350, 187.5, 37.5, 90],
    ]) {
      const result = computeDayMacros(calories, protein, carbs, floor);
      expect(protein * 4 + result.carbs * 4 + result.fat * 9).toBeCloseTo(
        calories,
        8,
      );
    }
  });
});

describe("computePlan", () => {
  it("returns null outside the supported weight range", () => {
    for (const startWeight of [99, 301, NaN]) {
      expect(
        computePlan({
          startWeight,
          direction: "gain",
          weeks: 12,
          percentageChange: 0.375,
        }),
      ).toBeNull();
    }
  });

  it("computes the default gain plan", () => {
    const plan = computePlan({
      startWeight: 140,
      direction: "gain",
      weeks: 12,
      percentageChange: 0.375,
    });
    expect(plan).not.toBeNull();
    if (plan === null) return;

    expect(plan.finalWeight).toBeCloseTo(146.3, 10);
    expect(plan.weeklyChange).toBeCloseTo(0.525, 10);
    expect(plan.totalChange).toBeCloseTo(6.3, 10);
    expect(plan.projections).toHaveLength(13);
    expect(plan.projections[0].weight).toBe(140);

    const rest = plan.dayPlans[0];
    expect(rest.label).toBe("Rest");
    expect(rest.calories).toBeCloseTo(1962.5, 10);
    expect(rest.protein).toBeCloseTo(161.875, 10);
    expect(rest.carbs).toBeCloseTo(91.875, 10);
    expect(rest.fat).toBeCloseTo(947.5 / 9, 10);
  });

  it("orders the green zone around the target for in-window rates", () => {
    for (const direction of ["gain", "lose"] as PlanDirection[]) {
      const plan = computePlan({
        startWeight: 200,
        direction,
        weeks: 10,
        percentageChange: direction === "gain" ? 0.375 : 0.75,
      });
      if (plan === null) throw new Error("expected a plan");
      for (const projection of plan.projections) {
        expect(projection.minWeight).toBeLessThanOrEqual(projection.weight);
        expect(projection.maxWeight).toBeGreaterThanOrEqual(projection.weight);
      }
    }
  });
});

describe("full input space invariants", () => {
  const directions: { direction: PlanDirection; percentages: number[] }[] = [
    { direction: "gain", percentages: [0.3, 0.35, 0.375, 0.4, 0.45] },
    { direction: "lose", percentages: [0.6, 0.7, 0.75, 0.8, 0.9] },
  ];

  it("never prescribes negative macros and always sums to calories", () => {
    for (const { direction, percentages } of directions) {
      for (let startWeight = 100; startWeight <= 300; startWeight++) {
        for (const percentageChange of percentages) {
          const plan = computePlan({
            startWeight,
            direction,
            weeks: 12,
            percentageChange,
          });
          if (plan === null) throw new Error("expected a plan");

          expect(
            Math.abs(plan.totalChange - plan.weeklyChange * 12),
          ).toBeLessThan(1e-9);
          expect(plan.projections).toHaveLength(13);
          expect(plan.projections[12].weight).toBeCloseTo(plan.finalWeight, 10);

          for (const day of plan.dayPlans) {
            expect(day.protein).toBeGreaterThan(0);
            expect(day.carbs).toBeGreaterThanOrEqual(0);
            expect(day.fat).toBeGreaterThanOrEqual(0);
            expect(day.protein * 4 + day.carbs * 4 + day.fat * 9).toBeCloseTo(
              day.calories,
              6,
            );
          }
        }
      }
    }
  });
});
