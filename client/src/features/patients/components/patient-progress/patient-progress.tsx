"use client";

import { EmptyState, PageLoader } from "@/components/ui";
import { usePatientProgress } from "../../queries";
import { ProgressCharts } from "./progress-charts";
import { MilestonesTimeline } from "./milestones-timeline";
import styles from "./patient-progress.module.scss";

interface PatientProgressProps {
  patientId: number;
}

export function PatientProgress({ patientId }: PatientProgressProps) {
  const progress = usePatientProgress(patientId);

  if (progress.isLoading) {
    return <PageLoader label="Loading progress..." />;
  }

  if (!progress.data) {
    return (
      <EmptyState
        title="Progress not available"
        description="We couldn't load progress data for this patient."
      />
    );
  }

  const { pain, rom, strength, milestones } = progress.data;
  const hasAnyData =
    pain.length > 0 ||
    rom.length > 0 ||
    strength.length > 0 ||
    milestones.length > 0;

  if (!hasAnyData) {
    return (
      <EmptyState
        title="No progress data yet"
        description="Progress charts are derived from clinical notes. Record at least two sessions with pain, ROM, or strength scores to see the trend."
      />
    );
  }

  return (
    <div className={styles.page}>
      <ProgressCharts pain={pain} rom={rom} strength={strength} />
      <MilestonesTimeline milestones={milestones} />
    </div>
  );
}
