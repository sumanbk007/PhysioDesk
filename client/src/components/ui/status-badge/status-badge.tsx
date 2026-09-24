"use client";

import { Tag } from "antd";
import styles from "./status-badge.module.scss";

type Tone = "success" | "warning" | "info" | "danger" | "neutral";

const TONE_MAP: Record<string, Tone> = {
  Active: "success",
  Completed: "success",
  "Due for follow-up": "warning",
  Booked: "info",
  Cancelled: "neutral",
  "No-show": "danger",
  Paid: "success",
  Partial: "warning",
  Due: "danger",
  Refunded: "neutral",
  Scheduled: "info",
  Sent: "success",
  Failed: "danger",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = TONE_MAP[status] ?? "neutral";
  return (
    <Tag className={`${styles.badge} ${styles[tone]}`} bordered={false}>
      {status}
    </Tag>
  );
}
