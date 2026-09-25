"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarCheck,
  ClipboardList,
  Phone,
  User as UserIcon,
} from "lucide-react";
import {
  Card,
  EmptyState,
  InfoList,
  PageLoader,
  StatusBadge,
  Timeline,
} from "@/components/ui";
import type { TimelineItem } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { usePatient, usePatientAppointments } from "@/features/patients/queries";
import { useTherapists } from "@/features/therapists/queries";
import styles from "./overview.module.scss";

export default function PatientOverviewPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id ?? 0);
  const patient = usePatient(id);
  const therapists = useTherapists({ page: 1, page_size: 100 });
  const appointments = usePatientAppointments(id, { page: 1, page_size: 20 });

  if (patient.isLoading || !patient.data) {
    return <PageLoader label="Loading patient..." />;
  }

  const p = patient.data;
  const therapist = therapists.data?.items.find((t) => t.id === p.therapist_id);
  const sessionsPct =
    p.sessions_total > 0
      ? Math.round((p.sessions_used / p.sessions_total) * 100)
      : 0;

  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);

  const allAppointments = appointments.data?.items ?? [];

  const upcoming = allAppointments
    .filter((a) => a.date >= todayIso && a.status === "Booked")
    .sort((a, b) =>
      a.date === b.date
        ? a.start_time.localeCompare(b.start_time)
        : a.date.localeCompare(b.date),
    )[0];

  const recent = allAppointments
    .filter((a) => a.status === "Completed")
    .sort((a, b) =>
      a.date === b.date
        ? b.start_time.localeCompare(a.start_time)
        : b.date.localeCompare(a.date),
    )
    .slice(0, 3);

  const therapistMap = new Map<number, string>();
  (therapists.data?.items ?? []).forEach((t) =>
    therapistMap.set(t.id, t.name),
  );

  const recentTimeline: TimelineItem[] = recent.map((appt) => ({
    key: appt.id,
    date: formatDate(appt.date, "short"),
    title: `${appt.start_time.slice(0, 5)} · ${therapistMap.get(appt.therapist_id) ?? "Therapist"}`,
    tone: "success",
  }));

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
        {upcoming ? (
          <div className={styles.next}>
            <div className={styles.nextDate}>
              {formatDate(upcoming.date, "long")}
            </div>
            <div className={styles.nextMeta}>
              <span>{upcoming.start_time.slice(0, 5)}</span>
              <span className={styles.dot}>·</span>
              <span>
                {therapistMap.get(upcoming.therapist_id) ?? "Therapist"}
              </span>
              <StatusBadge status={upcoming.status} />
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            No upcoming appointment scheduled.
          </div>
        )}
      </Card>

      <Card className={`${styles.card} ${styles.wide}`}>
        <div className={styles.cardHeader}>
          <UserIcon size={16} className={styles.icon} />
          <h2 className={styles.cardTitle}>Recent activity</h2>
          <Link
            href={`/patients/${id}/sessions`}
            className={styles.viewAll}
          >
            View all →
          </Link>
        </div>
        {appointments.isLoading ? (
          <div className={styles.empty}>Loading...</div>
        ) : recentTimeline.length === 0 ? (
          <EmptyState
            title="No completed sessions yet"
            description="Session history will appear here once treatments are recorded."
          />
        ) : (
          <Timeline items={recentTimeline} />
        )}
      </Card>
    </div>
  );
}
