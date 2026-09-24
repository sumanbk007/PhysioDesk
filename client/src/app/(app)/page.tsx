"use client";

import {
  CapacityStrip,
  RecentPatients,
  SummaryCards,
  useCapacity,
  useDashboardSummary,
  useRecentPatients,
} from "@/features/dashboard";
import { PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import styles from "./dashboard.module.scss";

export default function DashboardPage() {
  const summary = useDashboardSummary();
  const capacity = useCapacity();
  const recent = useRecentPatients(5);

  const today = new Date();

  return (
    <div className={styles.page}>
      <PageHeader
        title={formatDate(today, "long")}
        subtitle="Overview of today at the clinic."
      />

      <SummaryCards
        data={summary.data}
        loading={summary.isLoading || summary.isError}
      />

      <div className={styles.split}>
        <CapacityStrip
          data={capacity.data}
          loading={capacity.isLoading || capacity.isError}
        />
        <RecentPatients
          data={recent.data}
          loading={recent.isLoading || recent.isError}
        />
      </div>
    </div>
  );
}
