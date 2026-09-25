"use client";

import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import { StatusBadge } from "@/components/ui";
import type { TherapistListItem } from "./types";
import styles from "./columns.module.scss";

export function makeTherapistColumns(): ColumnsType<TherapistListItem> {
  return [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (name: string, record) => (
        <Link
          href={`/therapists/${record.id}`}
          className={styles.nameLink}
          onClick={(e) => e.stopPropagation()}
        >
          {name}
        </Link>
      ),
    },
    {
      title: "Specialty",
      dataIndex: "specialty",
      key: "specialty",
      ellipsis: true,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      render: (phone: string | null) => (
        <span className={styles.mono}>{phone ?? "—"}</span>
      ),
    },
    {
      title: "Experience",
      dataIndex: "experience_years",
      key: "experience_years",
      width: 120,
      render: (years: number | null) =>
        years === null ? (
          <span className={styles.muted}>—</span>
        ) : (
          <span className={styles.muted}>
            {years} {years === 1 ? "year" : "years"}
          </span>
        ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (active: boolean) => (
        <StatusBadge status={active ? "Active" : "Cancelled"} />
      ),
    },
  ];
}
