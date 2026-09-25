"use client";

import { ReactNode } from "react";
import styles from "./info-list.module.scss";

export interface InfoListItem {
  label: string;
  value: ReactNode;
}

interface InfoListProps {
  items: InfoListItem[];
  columns?: 1 | 2;
}

export function InfoList({ items, columns = 1 }: InfoListProps) {
  return (
    <dl
      className={`${styles.list} ${columns === 2 ? styles.two : styles.one}`}
    >
      {items.map((item, idx) => (
        <div key={idx} className={styles.row}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value ?? <span className={styles.empty}>—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
