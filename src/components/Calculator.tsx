import { useState, useMemo } from "react";

import { range, formatNumber } from "../helpers";
import {
  computePlan,
  PlanDirection,
  PlanInputs,
  SUPPORTED_WEIGHT_RANGE,
} from "../plan";
import { ProjectionChart } from "./ProjectionChart";
import { Selector } from "./Selector";

type DirectionConfig = {
  resultText: string;
  pastResultText: string;
  minWeeks: number;
  maxWeeks: number;
  defaultWeeks: number;
  defaultPercentage: number;
  selectablePercentages: number[];
};

const directionConfigs: Record<PlanDirection, DirectionConfig> = {
  gain: {
    resultText: "gain",
    pastResultText: "gained",
    minWeeks: 6,
    maxWeeks: 16,
    defaultWeeks: 12,
    defaultPercentage: 0.375,
    selectablePercentages: [0.3, 0.35, 0.375, 0.4, 0.45],
  },
  lose: {
    resultText: "loss",
    pastResultText: "lost",
    minWeeks: 6,
    maxWeeks: 12,
    defaultWeeks: 10,
    defaultPercentage: 0.75,
    selectablePercentages: [0.6, 0.7, 0.75, 0.8, 0.9],
  },
};

const defaultInputs: PlanInputs = {
  startWeight: 140,
  direction: "gain",
  weeks: directionConfigs.gain.defaultWeeks,
  percentageChange: directionConfigs.gain.defaultPercentage,
};

export function Calculator() {
  const [calculatorState, setCalculatorState] =
    useState<PlanInputs>(defaultInputs);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const directionConfig = directionConfigs[calculatorState.direction];

  const plan = useMemo(() => computePlan(calculatorState), [calculatorState]);

  return (
    <div className="mt-6 text-lg leading-[3.5rem] sm:mt-8">
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="mx-auto max-w-xs xs:max-w-md sm:max-w-xl">
          <p>
            <span className="mr-2">I currently weigh</span>
            <input
              id="start"
              name="start"
              type="number"
              min={SUPPORTED_WEIGHT_RANGE.min}
              max={SUPPORTED_WEIGHT_RANGE.max}
              inputMode="numeric"
              pattern="[0-9]*"
              value={
                Number.isNaN(calculatorState.startWeight)
                  ? ""
                  : calculatorState.startWeight
              }
              onChange={(event) =>
                setCalculatorState((prev) => ({
                  ...prev,
                  startWeight: parseInt(event.target.value),
                }))
              }
              className="mr-2 w-16 rounded-lg border-0 text-center text-zinc-900 ring-1 ring-inset ring-zinc-400 [appearance:textfield] placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-600 sm:text-base [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            {"pounds."}
          </p>
          <div className={plan !== null ? "visible" : "hidden"}>
            <p>
              I want to
              <Selector
                name="direction"
                options={Object.keys(directionConfigs) as PlanDirection[]}
                value={calculatorState.direction}
                onChange={(val) =>
                  setCalculatorState((prev) => ({
                    ...prev,
                    direction: val,
                    weeks: directionConfigs[val].defaultWeeks,
                    percentageChange: directionConfigs[val].defaultPercentage,
                  }))
                }
              />
              <span>weight in a healthy, effective way.</span>
            </p>
            <p>
              <span>
                To do so, I will target a {directionConfig.resultText} of
              </span>
              <Selector
                name="percentageChange"
                options={directionConfig.selectablePercentages}
                value={calculatorState.percentageChange}
                onChange={(val) =>
                  setCalculatorState((prev) => ({
                    ...prev,
                    percentageChange: val,
                  }))
                }
              />
              <span>percent</span>
              <span> of my starting body weight per week for</span>
              <Selector
                name="weeks"
                options={range(
                  directionConfig.minWeeks,
                  directionConfig.maxWeeks,
                  1,
                )}
                value={calculatorState.weeks}
                onChange={(val) =>
                  setCalculatorState((prev) => ({
                    ...prev,
                    weeks: val,
                  }))
                }
              />
              <span>weeks.</span>{" "}
              <button
                type="button"
                onClick={() => {
                  setShowExplanation((prev) => !prev);
                }}
                className="cursor-pointer leading-normal text-blue-500 underline decoration-dotted underline-offset-[5px]"
              >
                Why these options?
              </button>
            </p>
            {showExplanation && (
              <p className="mx-auto mt-4 rounded-lg bg-zinc-100 px-6 py-4 leading-loose shadow">
                {calculatorState.direction === "gain" ? (
                  <span>
                    While gaining, I will likely want to gain more muscle than
                    fat. The best muscle gain results generally occur when
                    gaining between 0.25% and 0.5% of body weight per week for a
                    duration of 6 to 16 weeks.
                    <a
                      href="#footnote1"
                      id="ref1"
                      className="font-bold text-blue-500"
                    >
                      <sup>1</sup>
                    </a>
                  </span>
                ) : (
                  <span>
                    While losing, I will likely want to lose more fat than
                    muscle. The best fat loss results generally occur when
                    losing between 0.5% and 1% of body weight per week for a
                    duration of 6 to 12 weeks.
                    <a
                      href="#footnote1"
                      id="ref1"
                      className="font-bold text-blue-500"
                    >
                      <sup>1</sup>
                    </a>
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </form>

      <hr className="mx-auto mt-6 max-w-xs sm:max-w-xl" />
      <div className={plan !== null ? "visible mt-6 space-y-6" : "hidden"}>
        <p className="mx-auto max-w-xs sm:max-w-xl">
          Following this plan, my weight will roughly trend like this, with each
          data point representing my average weight during that week:{" "}
        </p>
        <div className="mx-auto flex max-w-sm items-center justify-center xs:max-w-md sm:max-w-[52rem]">
          <div className="h-[400px] w-full sm:mr-[8%] sm:h-[480px]">
            <ProjectionChart
              projections={plan?.projections ?? []}
              units="pounds"
              showWindow={false}
            />
          </div>
        </div>
        <p className="mx-auto max-w-xs sm:max-w-xl">
          At the end of the {calculatorState.weeks} weeks, my results will look
          something like this:
        </p>
        <div className="mx-auto mt-4 flex max-w-xs justify-between leading-tight sm:max-w-xl">
          <div>
            <p className="text-xl font-medium tabular-nums tracking-tight">
              {plan?.finalWeight.toFixed(1)}
              <span className="ml-1 text-lg font-normal text-zinc-500">lb</span>
            </p>
            <p className="mt-1 text-base text-zinc-600">weight</p>
          </div>
          <div className="w-px self-stretch bg-zinc-200" />
          <div>
            <p className="text-xl font-medium tabular-nums tracking-tight">
              {plan?.weeklyChange.toFixed(2)}
              <span className="ml-1 text-lg font-normal text-zinc-500">lb</span>
            </p>
            <p className="mt-1 text-base text-zinc-600">
              {directionConfig.pastResultText} per week
            </p>
          </div>
          <div className="w-px self-stretch bg-zinc-200" />
          <div>
            <p className="text-xl font-medium tabular-nums tracking-tight">
              {plan?.totalChange.toFixed(1)}
              <span className="ml-1 text-lg font-normal text-zinc-500">lb</span>
            </p>
            <p className="mt-1 text-base text-zinc-600">
              total {directionConfig.pastResultText}
            </p>
          </div>
        </div>
        <p className="mx-auto max-w-xs sm:max-w-xl">
          To stay on track with my targeted weight {directionConfig.resultText}{" "}
          and achieve the best physique, I will want to eat approximately the
          following each day, composed of as many healthy foods as possible:
        </p>
        <div className="mx-auto max-w-xs overflow-x-auto leading-normal sm:max-w-xl">
          <table className="w-full min-w-[20rem] border-collapse text-base">
            <thead>
              <tr>
                <th className="border-b border-zinc-200 pb-2 text-left text-base font-medium text-zinc-500">
                  Day
                </th>
                {["Calories", "Protein", "Carbs", "Fat"].map((heading) => (
                  <th
                    key={heading}
                    className="border-b border-zinc-200 pb-2 pl-3 text-right text-base font-medium text-zinc-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plan?.dayPlans.map((day, index, days) => {
                const border =
                  index < days.length - 1 ? " border-b border-zinc-100" : "";
                const numCell =
                  "py-2.5 pl-3 text-right text-lg tabular-nums" + border;
                const gram = (
                  <span className="text-base font-normal text-zinc-500">
                    {" "}
                    g
                  </span>
                );
                return (
                  <tr key={day.label}>
                    <td className={"py-2.5 text-lg text-zinc-700" + border}>
                      {day.label}
                    </td>
                    <td className={numCell}>{formatNumber(day.calories)}</td>
                    <td className={numCell}>
                      {formatNumber(day.protein)}
                      {gram}
                    </td>
                    <td className={numCell}>
                      {formatNumber(day.carbs)}
                      {gram}
                    </td>
                    <td className={numCell}>
                      {formatNumber(day.fat)}
                      {gram}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mx-auto max-w-xs sm:max-w-xl">
          But even if I stick to this, my progress will probably not look like a
          perfect straight line. There are just too many variables at play.
        </p>
        <p className="mx-auto max-w-xs sm:max-w-xl">
          I also acknowledge that dieting too fast can be hard on the body and
          dieting too slow can diminish the positive benefits.
        </p>
        <p className="mx-auto max-w-xs sm:max-w-xl">
          So each week, I will calculate my average weight for the week and make
          sure it is in what I call the "green zone", shown below:
        </p>
        <div className="mx-auto flex max-w-sm items-center justify-center xs:max-w-md sm:max-w-[52rem]">
          <div className="h-[400px] w-full sm:mr-[8%] sm:h-[480px]">
            <ProjectionChart
              projections={plan?.projections ?? []}
              units="pounds"
              showWindow={true}
            />
          </div>
        </div>
        <p className="mx-auto max-w-xs sm:max-w-xl">
          If I keep an eye on that "green zone" and adjust the calorie
          recommendations as needed to stay within it, I will reach my goal and
          feel good knowing that I did so in a healthy way.
        </p>
      </div>
      {plan === null && (
        <p className="mx-auto mt-6 max-w-xs rounded-lg bg-zinc-100 px-6 py-4 leading-loose shadow xs:max-w-md sm:max-w-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="inline-block pb-1"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <span>
            {"  "}
            Please enter a number between {SUPPORTED_WEIGHT_RANGE.min} and{" "}
            {SUPPORTED_WEIGHT_RANGE.max} pounds for your starting weight. The
            Minimum Effective Diet doesn't yet have the data needed to support
            weights outside of that range.
          </span>
        </p>
      )}
      {plan !== null && (
        <div className="mx-auto mt-8 max-w-xs space-y-4 rounded-xl bg-zinc-100 px-8 py-6 leading-loose xs:max-w-md sm:max-w-xl">
          <h2 className="text-2xl">The Minimum Effective Diet Explained</h2>
          <p>
            The Minimum Effective Diet aims to be a foolproof way for someone to
            get started on a weight gain or weight loss journey they can trust
            to be evidence-based and effective.
          </p>
          <p>
            It gets its name from the term Minimum Effective Dose and is as
            simple as making four selections, getting started, and adhering.
          </p>

          <p id="footnote1">
            <sup>1</sup> Percentage ranges, week ranges, and calorie estimates
            are pulled from{" "}
            <a
              className="text-blue-500 underline decoration-dotted underline-offset-[5px]"
              target="_blank"
              rel="noopener noreferrer"
              href="https://rpstrength.com/products/rp-diet-book-v2"
            >
              The Renaissance Diet 2.0
            </a>
            .
          </p>
          <p>
            DISCLAIMER: Though The Minimum Effective Diet is based on work from
            licensed professionals, I am not a licensed medical or nutritional
            professional. At the end of the day, it is up to you to make the
            final decision about your body and your diet. Use this not as advice
            but as a tool in your toolkit.
          </p>
        </div>
      )}
    </div>
  );
}
