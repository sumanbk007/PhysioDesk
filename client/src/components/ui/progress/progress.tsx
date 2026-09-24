"use client";

import { Progress as AntProgress } from "antd";
import styles from "./progress.module.scss";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "small" | "default" | "large";
  tone?: "default" | "warning" | "danger" | "success";
  showLabel?: boolean;
}

export function Progress({
  value,
  max = 100,
  size = "default",
  tone = "default",
  showLabel = false,
}: ProgressProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const strokeColor =
    tone === "danger"
      ? "#f43f5e"
      : tone === "warning"
        ? "#f59e0b"
        : tone === "success"
          ? "#10b981"
          : "#14b8a6";

  return (
    <div className={`${styles.wrapper} ${styles[size]}`}>
      <AntProgress
        percent={percent}
        showInfo={false}
        strokeColor={strokeColor}
        trailColor="#f1f5f9"
        size={size === "small" ? "small" : "default"}
      />
      {showLabel && <span className={styles.label}>{percent}%</span>}
    </div>
  );
}
