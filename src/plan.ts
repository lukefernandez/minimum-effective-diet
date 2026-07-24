/*
 * The diet plan module. Four inputs — starting weight, direction, weekly
 * rate, and duration — go in; the complete plan comes out: projected weekly
 * weights with their healthy-rate window (the "green zone"), the outcome
 * numbers, and per-day calorie/macro targets.
 *
 */

export type PlanDirection = "gain" | "lose";

export type PlanInputs = {
  /** Starting body weight in pounds; supported range is 100–300. */
  startWeight: number;
  direction: PlanDirection;
  /** Plan duration in weeks. */
  weeks: number;
  /** Weekly change as a percent of starting body weight. */
  percentageChange: number;
};

export type WeekProjection = {
  week: number;
  /** Target average weight for the week, in pounds. */
  weight: number;
  /** Bottom of the healthy-rate window ("green zone") for the week. */
  minWeight: number;
  /** Top of the healthy-rate window for the week. */
  maxWeight: number;
};

export type DayPlan = {
  label: "Rest" | "Easy" | "Medium" | "Hard";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Plan = {
  projections: WeekProjection[];
  finalWeight: number;
  /** Pounds per week, always positive; direction carries the sign. */
  weeklyChange: number;
  /** Total pounds gained or lost, always positive. */
  totalChange: number;
  dayPlans: DayPlan[];
};

/*
 * The weights the maintenance-calorie chart covers, in pounds. computePlan
 * returns null outside this range; UI constraints and copy derive from it.
 */
export const SUPPORTED_WEIGHT_RANGE = { min: 100, max: 300 };

/** Returns null when startWeight is outside SUPPORTED_WEIGHT_RANGE. */
export function computePlan(inputs: PlanInputs): Plan | null {
  const { startWeight, direction, weeks, percentageChange } = inputs;
  if (
    !(
      startWeight >= SUPPORTED_WEIGHT_RANGE.min &&
      startWeight <= SUPPORTED_WEIGHT_RANGE.max
    )
  ) {
    return null;
  }

  const sign = direction === "gain" ? 1 : -1;
  const weeklyChange = startWeight * (percentageChange / 100);
  const window = healthyRateWindows[direction];

  const projections = Array.from(
    { length: weeks + 1 },
    (_, week): WeekProjection => {
      const weight = startWeight + weeklyChange * week * sign;
      let minWeight = startWeight * (1 + (window.min / 100) * week * sign);
      let maxWeight = startWeight * (1 + (window.max / 100) * week * sign);
      if (direction === "lose") {
        [minWeight, maxWeight] = [maxWeight, minWeight];
      }
      return { week, weight, minWeight, maxWeight };
    },
  );

  // Daily surplus/deficit: 3500 kcal per pound of weekly change, over 7 days.
  // A third of it goes to each macro; fat's share is implicit in the
  // remainder computed by computeDayMacros.
  const additionalCalories = weeklyChange * (3500 / 7) * sign;
  const protein = startWeight + additionalCalories / 12;
  const fatFloor = startWeight * MIN_FAT_GRAMS_PER_POUND;

  const dayPlans: DayPlan[] = [];
  for (const day of dayDefinitions) {
    const maintenance = getMaintenanceCalories(startWeight, day.intensity);
    if (maintenance === null) {
      return null; // unreachable after the range check; keeps the types honest
    }
    const calories = maintenance + additionalCalories;
    const evenSplitCarbs =
      startWeight * day.carbsPerPound + additionalCalories / 12;
    const { carbs, fat } = computeDayMacros(
      calories,
      protein,
      evenSplitCarbs,
      fatFloor,
    );
    dayPlans.push({ label: day.label, calories, protein, carbs, fat });
  }

  const finalWeight = projections[projections.length - 1].weight;
  return {
    projections,
    finalWeight,
    weeklyChange,
    totalChange: Math.abs(finalWeight - startWeight),
    dayPlans,
  };
}

// Healthy weekly rates as a percent of starting body weight — the green zone.
const healthyRateWindows: Record<PlanDirection, { min: number; max: number }> =
  {
    gain: { min: 0.25, max: 0.5 },
    lose: { min: 0.5, max: 1 },
  };

const dayDefinitions = [
  { label: "Rest", intensity: "non-training", carbsPerPound: 0.5 },
  { label: "Easy", intensity: "light", carbsPerPound: 1.0 },
  { label: "Medium", intensity: "moderate", carbsPerPound: 1.5 },
  { label: "Hard", intensity: "hard", carbsPerPound: 2.0 },
] as const;

// Minimum healthy fat intake, in grams per pound of body weight.
export const MIN_FAT_GRAMS_PER_POUND = 0.3;

type DayMacros = {
  carbs: number;
  fat: number;
};

/*
 * Fat is the remainder after protein and carbs, floored at fatFloor so a
 * large deficit can never prescribe near-zero (or negative) fat. When the
 * floor binds, carbs absorb the difference; if calories can't cover both
 * protein and the fat floor, carbs go to zero and fat takes what's left.
 * In every branch the macros sum exactly to the day's calories.
 */
export function computeDayMacros(
  calories: number,
  protein: number,
  carbs: number,
  fatFloor: number,
): DayMacros {
  let fat = (calories - (protein + carbs) * 4) / 9;
  if (fat < fatFloor) {
    fat = fatFloor;
    carbs = (calories - protein * 4 - fat * 9) / 4;
    if (carbs < 0) {
      carbs = 0;
      fat = (calories - protein * 4) / 9;
    }
  }
  return { carbs, fat };
}

type CalorieRow = {
  maxWeight: number;
  calories: [number, number, number, number];
};

export type IntensityLevel = "non-training" | "light" | "moderate" | "hard";

const calorieChart: CalorieRow[] = [
  { maxWeight: 115, calories: [1300, 1500, 1700, 1900] },
  { maxWeight: 130, calories: [1500, 1700, 1900, 2100] },
  { maxWeight: 145, calories: [1700, 1900, 2100, 2300] },
  { maxWeight: 160, calories: [1800, 2000, 2250, 2450] },
  { maxWeight: 175, calories: [1900, 2100, 2400, 2600] },
  { maxWeight: 190, calories: [1950, 2200, 2500, 2750] },
  { maxWeight: 210, calories: [2000, 2300, 2600, 2900] },
  { maxWeight: 230, calories: [2150, 2500, 2800, 3100] },
  { maxWeight: 250, calories: [2300, 2700, 3000, 3300] },
  { maxWeight: 275, calories: [2500, 2900, 3250, 3600] },
  { maxWeight: 300, calories: [2700, 3100, 3500, 3900] },
];

const intensityIndex: Record<IntensityLevel, number> = {
  "non-training": 0,
  light: 1,
  moderate: 2,
  hard: 3,
};

export function getMaintenanceCalories(
  weight: number,
  intensity: IntensityLevel,
): number | null {
  if (
    weight < SUPPORTED_WEIGHT_RANGE.min ||
    weight > SUPPORTED_WEIGHT_RANGE.max ||
    !(intensity in intensityIndex)
  ) {
    return null;
  }

  const row = calorieChart.find((row) => weight <= row.maxWeight);
  return row ? row.calories[intensityIndex[intensity]] : null;
}
