"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScheduleHeader } from "@/features/schedule/components/schedule-header";
import { ScheduleGrid } from "@/features/schedule/components/schedule-grid";
import { AppointmentFormModal } from "@/features/schedule/components/appointment-form-modal";
import { AppointmentDetailDrawer } from "@/features/schedule/components/appointment-detail-drawer";
import { useDaySchedule } from "@/features/schedule/queries";
import { useTherapists } from "@/features/therapists/queries";
import type { SlotRead, TherapistDaySchedule } from "@/features/schedule/types";
import styles from "./schedule.module.scss";

export default function SchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const todayIso = new Date().toISOString().slice(0, 10);
  const date = searchParams.get("date") ?? todayIso;
  const therapistId = searchParams.get("therapist_id")
    ? Number(searchParams.get("therapist_id"))
    : undefined;

  const [bookSlot, setBookSlot] = useState<{
    therapist: TherapistDaySchedule;
    slot: SlotRead;
  } | null>(null);
  const [viewAppointmentId, setViewAppointmentId] = useState<number | null>(
    null,
  );

  const schedule = useDaySchedule({ date, therapist_id: therapistId });
  const therapists = useTherapists({ page: 1, page_size: 100 });

  const therapistOptions = useMemo(
    () =>
      (therapists.data?.items ?? []).map((t) => ({
        value: t.id,
        label: t.name,
      })),
    [therapists.data],
  );

  const updateParams = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    router.replace(`/schedule?${next.toString()}`);
  };

  const summary = useMemo(() => {
    if (!schedule.data) return undefined;
    const total = schedule.data.therapists.reduce(
      (sum, t) => sum + t.total_slots,
      0,
    );
    const booked = schedule.data.therapists.reduce(
      (sum, t) => sum + t.booked_slots,
      0,
    );
    return `${total} slots · ${booked} booked`;
  }, [schedule.data]);

  return (
    <div className={styles.page}>
      <ScheduleHeader
        date={date}
        onDateChange={(d) => updateParams({ date: d })}
        therapistId={therapistId}
        onTherapistChange={(id) => updateParams({ therapist_id: id })}
        therapistOptions={therapistOptions}
        onBookClick={() => {
          // For a generic "Book" click we don't have a preselected slot —
          // prompt the user to click a slot instead.
          // Simplest UX: do nothing and rely on empty-slot clicks.
          // (Alternative: open a form with a date/time picker — bigger feature.)
        }}
        summary={summary}
      />

      <ScheduleGrid
        schedule={schedule.data}
        loading={schedule.isLoading}
        onBookSlot={(therapist, slot) => setBookSlot({ therapist, slot })}
        onViewSlot={(slot) => {
          if (slot.appointment_id) setViewAppointmentId(slot.appointment_id);
        }}
      />

      <AppointmentFormModal
        open={bookSlot !== null}
        onClose={() => setBookSlot(null)}
        mode="book"
        slot={
          bookSlot
            ? {
                therapist: bookSlot.therapist,
                slot: bookSlot.slot,
                date,
              }
            : undefined
        }
      />

      <AppointmentDetailDrawer
        appointmentId={viewAppointmentId}
        onClose={() => setViewAppointmentId(null)}
      />
    </div>
  );
}
