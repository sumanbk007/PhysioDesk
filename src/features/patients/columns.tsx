"use client";

import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import { Progress, StatusBadge } from "@/components/ui";
import type { PatientListItem } from "./types";
import styles from "./columns.module.scss";

export function makeColumns(): ColumnsType<PatientListItem> {
  return [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (name: string, record) => (
        <Link
          href={`/patients/${record.id}`}
          className={styles.nameLink}
          onClick={(e) => e.stopPropagation()}
        >
          {name}
        </Link>
      ),
    },
    {
      title: "Age · Gender",
      key: "age_gender",
      width: 110,
      render: (_, r) => (
        <span className={styles.muted}>
          {r.age} · {r.gender.charAt(0)}
        </span>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 140,
      render: (phone: string) => (
        <span className={styles.mono}>{phone}</span>
      ),
    },
    {
      title: "Condition",
      dataIndex: "condition",
      key: "condition",
      ellipsis: true,
      render: (c: string) => <span className={styles.condition}>{c}</span>,
    },
    {
      title: "Sessions",
      key: "sessions",
      width: 160,
      render: (_, r) => (
        <div className={styles.sessions}>
          <div className={styles.sessionCount}>
            <span className={styles.used}>{r.sessions_used}</span>
            <span className={styles.total}> / {r.sessions_total}</span>
          </div>
          <Progress
            value={r.sessions_used}
            max={r.sessions_total || 1}
            size="small"
          />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => <StatusBadge status={status} />,
    },
  ];
}
