"use client";

import { ReactNode } from "react";
import styles from "./timeline.module.scss";

export interface TimelineItem {
  key: string | number;
  date: string;
  title?: string;
  subtitle?: ReactNode;
  description?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  action?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <ol className={styles.timeline}>
      {items.map((item) => (
        <li key={item.key} className={styles.item}>
          <span
            className={`${styles.dot} ${styles[item.tone ?? "default"]}`}
            aria-hidden="true"
          />
          <div className={styles.content}>
            <div className={styles.head}>
              <span className={styles.date}>{item.date}</span>
              {item.title && <span className={styles.title}>{item.title}</span>}
            </div>
            {item.subtitle && (
              <div className={styles.subtitle}>{item.subtitle}</div>
            )}
            {item.description && (
              <div className={styles.description}>{item.description}</div>
            )}
            {item.action && <div className={styles.action}>{item.action}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
