"use client";

import { CalendarCheck, DollarSign, Stethoscope, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, Skeleton } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { DashboardSummary } from "../../types";
import styles from "./summary-cards.module.scss";

interface SummaryCardsProps {
  data?: DashboardSummary;
  loading: boolean;
}

interface StatConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  value: string;
  hint?: string;
}

export function SummaryCards({ data, loading }: SummaryCardsProps) {
  if (loading || !data) {
    return (
      <div className={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className={styles.card}>
            <Skeleton rows={2} />
          </Card>
        ))}
      </div>
    );
  }

  const stats: StatConfig[] = [
    {
      key: "patients",
      label: "Patients today",
      icon: Users,
      value: String(data.patients_seen_today),
      hint: "Completed appointments",
    },
    {
      key: "therapists",
      label: "Therapists on duty",
      icon: Stethoscope,
      value: String(data.therapists_on_duty),
      hint: "Active this shift",
    },
    {
      key: "revenue",
      label: "Revenue today",
      icon: DollarSign,
      value: formatCurrency(data.revenue_today),
      hint: "Settled payments",
    },
    {
      key: "slots",
      label: "Open slots today",
      icon: CalendarCheck,
      value: `${data.open_slots_today} ${data.open_slots_today === 1 ? "slot" : "slots"}`,
      hint: "Available for booking",
    },
  ];

  return (
    <div className={styles.grid}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.key} className={styles.card}>
            <div className={styles.header}>
              <span className={styles.label}>{stat.label}</span>
              <span className={styles.iconWrap}>
                <Icon size={16} />
              </span>
            </div>
            <div className={styles.value}>{stat.value}</div>
            {stat.hint && <div className={styles.hint}>{stat.hint}</div>}
          </Card>
        );
      })}
    </div>
  );
}
