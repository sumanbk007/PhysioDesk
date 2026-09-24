"use client";

import Link from "next/link";
import { Card, EmptyState, Skeleton, StatusBadge } from "@/components/ui";
import { getInitials } from "@/lib/utils";
import type { RecentPatient } from "../../types";
import styles from "./recent-patients.module.scss";

interface RecentPatientsProps {
  data?: RecentPatient[];
  loading: boolean;
}

export function RecentPatients({ data, loading }: RecentPatientsProps) {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>Recent patients</h2>
          <span className={styles.subtitle}>Latest additions to the clinic</span>
        </div>
        <Link href="/patients" className={styles.viewAll}>
          View all →
        </Link>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.item}>
              <Skeleton rows={2} />
            </div>
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No patients yet"
          description="Add your first patient to get started."
        />
      ) : (
        <div className={styles.list}>
          {data.map((patient) => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className={styles.item}
            >
              <div className={styles.avatar}>{getInitials(patient.name)}</div>
              <div className={styles.info}>
                <div className={styles.row}>
                  <span className={styles.name}>{patient.name}</span>
                  <StatusBadge status={patient.status} />
                </div>
                <div className={styles.meta}>
                  <span>{patient.phone}</span>
                </div>
              </div>
              <span className={styles.arrow}>→</span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
