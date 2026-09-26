"use client";

import {
  CalendarCheck,
  DollarSign,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, Skeleton } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { BillingDashboard } from "../../types";
import styles from "./billing-stats.module.scss";

interface BillingStatsProps {
  data?: BillingDashboard;
  loading: boolean;
}

interface StatConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  value: string;
  hint: string;
}

export function BillingStats({ data, loading }: BillingStatsProps) {
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
      key: "revenue",
      label: "Today's revenue",
      icon: DollarSign,
      value: formatCurrency(data.today_revenue),
      hint: "Payments received today",
    },
    {
      key: "pending",
      label: "Pending payments",
      icon: Wallet,
      value: formatCurrency(data.pending_payments),
      hint: "Across all open invoices",
    },
    {
      key: "patients",
      label: "Total patients",
      icon: Users,
      value: String(data.total_patients),
      hint: "Registered in the clinic",
    },
    {
      key: "appointments",
      label: "Today's appointments",
      icon: CalendarCheck,
      value: String(data.today_appointments),
      hint: "Booked for today",
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
            <div className={styles.hint}>{stat.hint}</div>
          </Card>
        );
      })}
    </div>
  );
}
