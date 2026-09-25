import type { DaySchedule, TherapistDaySchedule } from "./types";

/** All unique start times across every therapist's schedule, sorted ascending. */
export function collectTimeSlots(schedule: DaySchedule): string[] {
  const set = new Set<string>();
  for (const t of schedule.therapists) {
    for (const s of t.slots) {
      set.add(s.start_time);
    }
  }
  return Array.from(set).sort();
}

/** Find a specific slot in a specific therapist's day. */
export function findSlot(
  therapist: TherapistDaySchedule,
  startTime: string,
): TherapistDaySchedule["slots"][number] | null {
  return therapist.slots.find((s) => s.start_time === startTime) ?? null;
}

/** Compute the date string N days before/after the given date. */
export function shiftDate(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Format YYYY-MM-DD for the date navigation header. */
export function formatDateHeader(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00Z");
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
