"use client";

import {
  CapacityStrip,
  RecentPatients,
  SummaryCards,
  useCapacity,
  useDashboardSummary,
  useRecentPatients,
} from "@/features/dashboard";
import { Button, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import styles from "./dashboard.module.scss";
import { Plus } from "lucide-react";
import { useState } from "react";
import { PatientFormModal } from "@/features/patients/components/patient-form-modal";

export default function DashboardPage() {
  const summary = useDashboardSummary();
  const capacity = useCapacity();
  const recent = useRecentPatients(5);
  const [formOpen, setFormOpen] = useState(false);

  const today = new Date();

  return (
    <div className={styles.page}>
      <PageHeader
        title="Dashboard"
        subtitle={`Overview of the clinic · ${formatDate(today, "long")}`}
        action={
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => setFormOpen(true)}
          >
            Add patient
          </Button>
        }
      />

      {formOpen && (
        <PatientFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      )}

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
