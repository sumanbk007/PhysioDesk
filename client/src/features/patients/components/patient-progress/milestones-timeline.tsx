"use client";

import { Award } from "lucide-react";
import { Card, EmptyState, SectionHeader, Timeline } from "@/components/ui";
import type { TimelineItem } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { MilestoneItem } from "../../types";
import styles from "./milestones-timeline.module.scss";

interface MilestonesTimelineProps {
  milestones: MilestoneItem[];
}

export function MilestonesTimeline({ milestones }: MilestonesTimelineProps) {
  const items: TimelineItem[] = [...milestones]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m, idx) => ({
      key: `${m.date}-${idx}`,
      date: formatDate(m.date, "long"),
      title: m.text,
      tone: "warning",
    }));

  return (
    <Card className={styles.card}>
      <SectionHeader
        title="Treatment milestones"
        subtitle={
          milestones.length > 0
            ? `${milestones.length} ${milestones.length === 1 ? "milestone" : "milestones"} recorded`
            : "Progress markers from clinical notes"
        }
        action={<Award size={16} className={styles.icon} />}
      />

      {items.length === 0 ? (
        <div className={styles.emptyWrap}>
          <EmptyState
            title="No milestones yet"
            description="Mark a note as a milestone to see it appear here."
          />
        </div>
      ) : (
        <div className={styles.timelineWrap}>
          <Timeline items={items} />
        </div>
      )}
    </Card>
  );
}
