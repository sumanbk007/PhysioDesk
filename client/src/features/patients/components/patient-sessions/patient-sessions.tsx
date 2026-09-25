"use client";

import { Calendar, Clock, User as UserIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  EmptyState,
  PageLoader,
  SectionHeader,
  Select,
  StatusBadge,
  Timeline,
} from "@/components/ui";
import type { TimelineItem } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { useTherapists } from "@/features/therapists/queries";
import { usePatientAppointments } from "../../queries";
import type { AppointmentStatus } from "../../types";
import styles from "./patient-sessions.module.scss";

interface PatientSessionsProps {
  patientId: number;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Completed", label: "Completed" },
  { value: "Booked", label: "Booked" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "No-show", label: "No-show" },
];

function toneForStatus(
  status: AppointmentStatus,
): "default" | "success" | "warning" | "danger" {
  switch (status) {
    case "Completed":
      return "success";
    case "Booked":
      return "default";
    case "Cancelled":
      return "warning";
    case "No-show":
      return "danger";
    default:
      return "default";
  }
}

export function PatientSessions({ patientId }: PatientSessionsProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const appointments = usePatientAppointments(patientId, {
    page,
    page_size: pageSize,
  });
  const therapists = useTherapists({ page: 1, page_size: 100 });

  const therapistMap = useMemo(() => {
    const map = new Map<number, string>();
    (therapists.data?.items ?? []).forEach((t) => map.set(t.id, t.name));
    return map;
  }, [therapists.data]);

  const filtered = useMemo(() => {
    const items = appointments.data?.items ?? [];
    if (statusFilter === "all") return items;
    return items.filter((a) => a.status === statusFilter);
  }, [appointments.data, statusFilter]);

  const timelineItems: TimelineItem[] = filtered.map((appt) => {
    const therapistName =
      therapistMap.get(appt.therapist_id) ?? `Therapist #${appt.therapist_id}`;

    const dateLabel = formatDate(appt.date, "long");
    const timeLabel = appt.start_time.slice(0, 5);

    return {
      key: appt.id,
      date: `${dateLabel} · ${timeLabel}`,
      title: `Session · ${appt.status}`,
      subtitle: (
        <span className={styles.subtitleLine}>
          <UserIcon size={12} />
          <span>{therapistName}</span>
        </span>
      ),
      description: (
        <div className={styles.description}>
          <StatusBadge status={appt.status} />
        </div>
      ),
      tone: toneForStatus(appt.status),
    };
  });

  const total = appointments.data?.total ?? 0;
  const pages = appointments.data?.pages ?? 1;

  return (
    <Card>
      <div className={styles.header}>
        <SectionHeader
          title="Session history"
          subtitle={
            appointments.isLoading
              ? "Loading..."
              : `${total} ${total === 1 ? "session" : "sessions"} recorded`
          }
          action={
            <div className={styles.filters}>
              <Select
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(v) => setStatusFilter(String(v))}
                allowClear={false}
                className={styles.select}
              />
            </div>
          }
        />
      </div>

      {appointments.isLoading ? (
        <PageLoader label="Loading sessions..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar size={32} />}
          title={
            statusFilter === "all"
              ? "No sessions yet"
              : `No ${statusFilter.toLowerCase()} sessions`
          }
          description={
            statusFilter === "all"
              ? "Book an appointment from the Schedule page to get started."
              : "Try a different status filter."
          }
        />
      ) : (
        <div className={styles.timelineWrap}>
          <Timeline items={timelineItems} />
        </div>
      )}

      {pages > 1 && (
        <div className={styles.pagination}>
          <Button
            variant="default"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </Button>
          <span className={styles.pageLabel}>
            Page {page} of {pages}
          </span>
          <Button
            variant="default"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}

      <div className={styles.hint}>
        <Clock size={12} />
        <span>Showing up to {pageSize} sessions per page</span>
      </div>
    </Card>
  );
}
