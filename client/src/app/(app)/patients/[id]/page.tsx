"use client";

import { CalendarCheck, ClipboardList, Phone, User as UserIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { Card, InfoList, PageLoader } from "@/components/ui";
import { usePatient } from "@/features/patients/queries";
import { useTherapists } from "@/features/therapists/queries";
import styles from "./overview.module.scss";

export default function PatientOverviewPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id ?? 0);
  const patient = usePatient(id);
  const therapists = useTherapists({ page: 1, page_size: 100 });

  if (patient.isLoading || !patient.data) {
    return <PageLoader label="Loading patient..." />;
  }

  const p = patient.data;
  const therapist = therapists.data?.items.find((t) => t.id === p.therapist_id);
  const sessionsPct =
    p.sessions_total > 0
      ? Math.round((p.sessions_used / p.sessions_total) * 100)
      : 0;

  return (
    <div className={styles.grid}>
      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <Phone size={16} className={styles.icon} />
          <h2 className={styles.cardTitle}>Contact</h2>
        </div>
        <InfoList
          items={[
            { label: "Phone", value: p.phone },
            { label: "Age", value: p.age },
            { label: "Gender", value: p.gender },
            { label: "Address", value: p.address ?? "—" },
          ]}
        />
      </Card>

      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <ClipboardList size={16} className={styles.icon} />
          <h2 className={styles.cardTitle}>Care plan</h2>
        </div>
        <InfoList
          items={[
            { label: "Condition", value: p.condition },
            {
              label: "Therapist",
              value: therapist?.name ?? `#${p.therapist_id}`,
            },
            { label: "Package", value: p.package ?? "—" },
            {
              label: "Progress",
              value: (
                <div className={styles.progress}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${sessionsPct}%` }}
                    />
                  </div>
                  <span className={styles.progressLabel}>
                    {p.sessions_used} / {p.sessions_total} sessions
                  </span>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Card className={`${styles.card} ${styles.wide}`}>
        <div className={styles.cardHeader}>
          <CalendarCheck size={16} className={styles.icon} />
          <h2 className={styles.cardTitle}>Next appointment</h2>
        </div>
        <div className={styles.empty}>No upcoming appointment scheduled.</div>
      </Card>

      <Card className={`${styles.card} ${styles.wide}`}>
        <div className={styles.cardHeader}>
          <UserIcon size={16} className={styles.icon} />
          <h2 className={styles.cardTitle}>Recent activity</h2>
        </div>
        <div className={styles.empty}>
          Session history will appear here once the Sessions tab is built.
        </div>
      </Card>
    </div>
  );
}
