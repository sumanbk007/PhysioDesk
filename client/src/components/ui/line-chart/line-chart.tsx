"use client";

import {
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./line-chart.module.scss";

export interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartPoint[];
  height?: number;
  min?: number;
  max?: number;
  unit?: string;
  color?: string;
}

export function LineChart({
  data,
  height = 220,
  min,
  max,
  unit,
  color = "#14b8a6",
}: LineChartProps) {
  return (
    <div className={styles.wrapper} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 4, left: -16 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[min ?? "auto", max ?? "auto"]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
            }}
            formatter={(raw) => {
              const n = typeof raw === "number" ? raw : Number(raw);
              const display = Number.isFinite(n) ? String(n) : String(raw ?? "");
              return [unit ? `${display} ${unit}` : display, ""];
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}
