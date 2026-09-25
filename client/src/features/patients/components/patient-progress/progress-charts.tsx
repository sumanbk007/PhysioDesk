"use client";

import { Activity, HeartPulse, TrendingUp } from "lucide-react";
import { Card, EmptyState, LineChart, SectionHeader } from "@/components/ui";
import type { LineChartPoint } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { ProgressPoint } from "../../types";
import styles from "./progress-charts.module.scss";

interface ProgressChartsProps {
  pain: ProgressPoint[];
  rom: ProgressPoint[];
  strength: ProgressPoint[];
}

interface ChartSpec {
  key: string;
  title: string;
  subtitle: string;
  icon: typeof HeartPulse;
  color: string;
  unit: string;
  min: number;
  max: number;
}

const CHARTS: ChartSpec[] = [
  {
    key: "pain",
    title: "Pain over time",
    subtitle: "Lower is better. Scale 0–10.",
    icon: HeartPulse,
    color: "#f43f5e",
    unit: "",
    min: 0,
    max: 10,
  },
  {
    key: "rom",
    title: "Range of motion",
    subtitle: "Percentage of normal.",
    icon: Activity,
    color: "#0ea5e9",
    unit: "%",
    min: 0,
    max: 100,
  },
  {
    key: "strength",
    title: "Muscle strength",
    subtitle: "Manual muscle test grade (0–5).",
    icon: TrendingUp,
    color: "#14b8a6",
    unit: "/5",
    min: 0,
    max: 5,
  },
];

function toChartData(points: ProgressPoint[]): LineChartPoint[] {
  return points.map((p) => ({
    label: formatDate(p.date, "short"),
    value: p.value,
  }));
}

export function ProgressCharts({ pain, rom, strength }: ProgressChartsProps) {
  const series: Record<string, ProgressPoint[]> = { pain, rom, strength };

  return (
    <div className={styles.grid}>
      {CHARTS.map((chart) => {
        const points = series[chart.key] ?? [];
        const Icon = chart.icon;

        return (
          <Card key={chart.key} className={styles.card}>
            <SectionHeader
              title={chart.title}
              subtitle={chart.subtitle}
              action={<Icon size={16} className={styles.icon} />}
            />

            {points.length < 2 ? (
              <div className={styles.emptyWrap}>
                <EmptyState
                  title="Not enough data yet"
                  description="At least two recorded sessions are needed to chart this."
                />
              </div>
            ) : (
              <LineChart
                data={toChartData(points)}
                min={chart.min}
                max={chart.max}
                unit={chart.unit}
                color={chart.color}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}
