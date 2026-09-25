"use client";

import { ChevronLeft, ChevronRight, CalendarPlus } from "lucide-react";
import { Button, PageHeader, Select } from "@/components/ui";
import { formatDateHeader, shiftDate } from "../../utils";
import styles from "./schedule-header.module.scss";

interface TherapistOption {
  value: number;
  label: string;
}

interface ScheduleHeaderProps {
  date: string;
  onDateChange: (date: string) => void;
  therapistId?: number;
  onTherapistChange: (id: number | undefined) => void;
  therapistOptions: TherapistOption[];
  onBookClick: () => void;
  summary?: string;
}

export function ScheduleHeader({
  date,
  onDateChange,
  therapistId,
  onTherapistChange,
  therapistOptions,
  onBookClick,
  summary,
}: ScheduleHeaderProps) {
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.wrapper}>
      <PageHeader
        title="Schedule"
        subtitle={summary ?? "Day view"}
        action={
          <Button
            variant="primary"
            icon={<CalendarPlus size={14} />}
            onClick={onBookClick}
          >
            Book appointment
          </Button>
        }
      />

      <div className={styles.toolbar}>
        <div className={styles.nav}>
          <Button
            variant="default"
            icon={<ChevronLeft size={14} />}
            onClick={() => onDateChange(shiftDate(date, -1))}
            aria-label="Previous day"
          />
          <div className={styles.dateLabel}>{formatDateHeader(date)}</div>
          <Button
            variant="default"
            icon={<ChevronRight size={14} />}
            onClick={() => onDateChange(shiftDate(date, 1))}
            aria-label="Next day"
          />
          {date !== todayIso && (
            <Button
              variant="default"
              onClick={() => onDateChange(todayIso)}
            >
              Today
            </Button>
          )}
        </div>

        <div className={styles.filter}>
          <Select
            placeholder="All therapists"
            options={therapistOptions}
            value={therapistId}
            onChange={(v) => onTherapistChange(v as number | undefined)}
          />
        </div>
      </div>
    </div>
  );
}
