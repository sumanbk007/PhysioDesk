"use client";

import { Card, EmptyState, Progress, Skeleton } from "@/components/ui";
import { getInitials } from "@/lib/utils";
import type { CapacityEntry } from "../../types";
import styles from "./capacity-strip.module.scss";

interface CapacityStripProps {
  data?: CapacityEntry[];
  loading: boolean;
}

function tone(booked: number, total: number): "default" | "warning" | "danger" {
  if (total === 0) return "default";
  const ratio = booked / total;
  if (ratio >= 1) return "danger";
  if (ratio >= 0.8) return "warning";
  return "default";
}

export function CapacityStrip({ data, loading }: CapacityStripProps) {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Therapist capacity today</h2>
        <span className={styles.subtitle}>Active caseload allocation across current shift</span>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.item}>
              <Skeleton rows={2} />
            </div>
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No therapists on duty"
          description="Add therapists or check the working hours for today."
        />
      ) : (
        <div className={styles.list}>
          {data.map((entry) => {
            const pct = entry.total_slots > 0 ? (entry.booked_slots / entry.total_slots) * 100 : 0;
            return (
              <div key={entry.therapist_id} className={styles.item}>
                <div className={styles.avatar}>
                  {getInitials(entry.therapist_name)}
                </div>
                <div className={styles.info}>
                  <div className={styles.nameRow}>
                    <div className={styles.name}>{entry.therapist_name}</div>
                    <div className={styles.counts}>
                      <span className={styles.booked}>{entry.booked_slots}</span>
                      <span className={styles.total}> / {entry.total_slots} booked</span>
                    </div>
                  </div>
                  <Progress
                    value={entry.booked_slots}
                    max={entry.total_slots}
                    size="small"
                    tone={tone(entry.booked_slots, entry.total_slots)}
                  />
                  <div className={styles.meta}>
                    <span>{Math.round(pct)}% full</span>
                    <span className={styles.dot}>·</span>
                    <span>
                      {entry.free_slots} {entry.free_slots === 1 ? "slot" : "slots"} left
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
