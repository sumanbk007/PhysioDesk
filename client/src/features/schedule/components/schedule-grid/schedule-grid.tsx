"use client";

import { Fragment } from "react";
import { Card, EmptyState, PageLoader } from "@/components/ui";
import { collectTimeSlots, findSlot } from "../../utils";
import type { DaySchedule, SlotRead, TherapistDaySchedule } from "../../types";
import styles from "./schedule-grid.module.scss";

interface ScheduleGridProps {
  schedule?: DaySchedule;
  loading: boolean;
  onBookSlot: (
    therapist: TherapistDaySchedule,
    slot: SlotRead,
  ) => void;
  onViewSlot: (slot: SlotRead) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function toneForStatus(status: string | null): string {
  if (!status) return styles.toneNeutral;
  if (status === "Booked") return styles.toneInfo;
  if (status === "Completed") return styles.toneSuccess;
  if (status === "Cancelled") return styles.toneNeutral;
  if (status === "No-show") return styles.toneDanger;
  return styles.toneNeutral;
}

export function ScheduleGrid({
  schedule,
  loading,
  onBookSlot,
  onViewSlot,
}: ScheduleGridProps) {
  if (loading && !schedule) {
    return (
      <Card>
        <PageLoader label="Loading schedule..." />
      </Card>
    );
  }

  if (!schedule || schedule.therapists.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No therapists on this day"
          description="No active therapists are scheduled for this date."
        />
      </Card>
    );
  }

  const timeSlots = collectTimeSlots(schedule);
  const allOff = schedule.therapists.every((t) => t.is_off);

  if (timeSlots.length === 0 && allOff) {
    return (
      <Card>
        <EmptyState
          title="All therapists are off"
          description="Every therapist has a day off or an override on this date."
        />
      </Card>
    );
  }

  const gridTemplate = `80px repeat(${schedule.therapists.length}, minmax(180px, 1fr))`;

  return (
    <Card padded={false} className={styles.card}>
      <div className={styles.scroll} style={{ ["--cols" as string]: gridTemplate }}>
        <div className={styles.grid} style={{ gridTemplateColumns: gridTemplate }}>
          {/* Header row */}
          <div className={`${styles.corner} ${styles.headerCell}`} />
          {schedule.therapists.map((t) => (
            <div key={t.therapist_id} className={styles.headerCell}>
              <div className={styles.therapistHeader}>
                <div
                  className={`${styles.avatar} ${
                    t.is_off ? styles.avatarOff : ""
                  }`}
                >
                  {getInitials(t.therapist_name)}
                </div>
                <div className={styles.therapistInfo}>
                  <div className={styles.therapistName}>{t.therapist_name}</div>
                  {t.is_off ? (
                    <div className={styles.therapistMetaOff}>
                      Off{t.override_reason ? ` · ${t.override_reason}` : ""}
                    </div>
                  ) : (
                    <div className={styles.therapistMeta}>
                      {t.booked_slots} / {t.total_slots} booked
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Slot rows */}
          {timeSlots.map((time) => (
            <Fragment key={time}>
              <div className={`${styles.timeLabel} ${styles.leftCell}`}>
                {time.slice(0, 5)}
              </div>
              {schedule.therapists.map((therapist) => {
                const slot = findSlot(therapist, time);

                if (therapist.is_off) {
                  return (
                    <div
                      key={`${therapist.therapist_id}-${time}`}
                      className={`${styles.slotCell} ${styles.slotOff}`}
                    />
                  );
                }

                if (!slot) {
                  return (
                    <div
                      key={`${therapist.therapist_id}-${time}`}
                      className={`${styles.slotCell} ${styles.slotOutside}`}
                    />
                  );
                }

                if (slot.is_booked) {
                  return (
                    <button
                      key={`${therapist.therapist_id}-${time}`}
                      type="button"
                      className={`${styles.slotCell} ${styles.slotBooked} ${toneForStatus(slot.status)}`}
                      onClick={() => onViewSlot(slot)}
                    >
                      <div className={styles.slotPatient}>
                        {slot.patient_name ?? "Patient"}
                      </div>
                      <div className={styles.slotStatus}>{slot.status}</div>
                    </button>
                  );
                }

                return (
                  <button
                    key={`${therapist.therapist_id}-${time}`}
                    type="button"
                    className={`${styles.slotCell} ${styles.slotFree}`}
                    onClick={() => onBookSlot(therapist, slot)}
                  >
                    <span className={styles.slotFreeLabel}>+ Book</span>
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </Card>
  );
}
