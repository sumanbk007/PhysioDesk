"use client";

import { SearchInput, Select } from "@/components/ui";
import type { PatientListParams, PatientStatus } from "../../types";
import styles from "./patients-filters.module.scss";

interface PatientsFiltersProps {
  filters: PatientListParams;
  onChange: (filters: Partial<PatientListParams>) => void;
  therapistOptions: { value: number; label: string }[];
  statusOptions: { value: string; label: string }[];
}

export function PatientsFilters({
  filters,
  onChange,
  therapistOptions,
  statusOptions,
}: PatientsFiltersProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.search}>
        <SearchInput
          value={filters.search ?? ""}
          onChange={(v) => onChange({ search: v, page: 1 })}
          placeholder="Search by name or phone"
        />
      </div>

      <div className={styles.select}>
        <Select
          placeholder="Therapist"
          options={therapistOptions}
          value={filters.therapist_id}
          onChange={(v) =>
            onChange({ therapist_id: v as number | undefined, page: 1 })
          }
        />
      </div>

      <div className={styles.select}>
        <Select
          placeholder="Status"
          options={statusOptions}
          value={filters.status}
          onChange={(v) =>
            onChange({ status: v as PatientStatus | undefined, page: 1 })
          }
        />
      </div>
    </div>
  );
}
