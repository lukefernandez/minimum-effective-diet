import { useEffect, useState, useMemo } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  TooltipProps,
} from "recharts";

import { WeekProjection } from "../plan";

type Props = {
  projections: WeekProjection[];
  units: string;
  showWindow: boolean;
};

function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="w-60 rounded-lg bg-white p-3 shadow ring-1 ring-zinc-300">
      <p className="text-sm font-semibold text-zinc-900">Week {label}</p>
      <div className="mt-1">
        {payload
          .filter((item) => item.name !== "window")
          .map((val) => (
            <p key={val.name} className="flex justify-between text-sm">
              <span className="text-zinc-600">{val.name}:</span>
              <span className="text-zinc-600">{val.value?.toFixed(1)}</span>
            </p>
          ))}
      </div>
    </div>
  );
}

export function ProjectionChart({ projections, units, showWindow }: Props) {
  const [animate, setAnimate] = useState(true);

  const chartData = useMemo(
    () =>
      projections.map((projection) => ({
        ...projection,
        window: [projection.minWeight, projection.maxWeight],
      })),
    [projections],
  );

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 1600);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  const { graphMinWeight, graphMaxWeight, yAxisPadding } = useMemo(() => {
    if (projections.length === 0)
      return { graphMinWeight: 0, graphMaxWeight: 0, yAxisPadding: 0 };

    const isGain =
      projections[0].weight < projections[projections.length - 1].weight;
    const graphMinWeight = isGain
      ? projections[0].minWeight
      : projections[projections.length - 1].minWeight;
    const graphMaxWeight = isGain
      ? projections[projections.length - 1].maxWeight
      : projections[0].maxWeight;
    const yAxisPadding = (graphMaxWeight - graphMinWeight) * 0.1;

    return { graphMinWeight, graphMaxWeight, yAxisPadding };
  }, [projections]);

  if (projections.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" label={{ value: "Week", position: "bottom" }} />
        <YAxis
          domain={[
            Math.floor(graphMinWeight - yAxisPadding),
            Math.ceil(graphMaxWeight + yAxisPadding),
          ]}
          label={{
            value: `Weight in ${units}`,
            angle: -90,
            position: "left",
            offset: -1,
            style: { textAnchor: "middle" },
          }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} animationDuration={200} />
        {showWindow && (
          <Area
            dataKey="window"
            stroke="none"
            fill="#16c24a"
            legendType="none"
            fillOpacity={0.7}
            isAnimationActive={animate}
          />
        )}
        <Line
          type="monotone"
          name="Target Weight"
          dataKey="weight"
          strokeWidth={2}
          stroke="#18181b"
          isAnimationActive={animate}
        />
        {showWindow && (
          <>
            <Line
              type="monotone"
              dot={false}
              dataKey="minWeight"
              name="Min Weight"
              strokeWidth={2}
              stroke="#18181b"
              isAnimationActive={animate}
            />
            <Line
              type="monotone"
              dot={false}
              name="Max Weight"
              dataKey="maxWeight"
              strokeWidth={2}
              stroke="#18181b"
              isAnimationActive={animate}
            />
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
