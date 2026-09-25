"use client";

import { SearchInput, Select } from "@/components/ui";
import type { TherapistListParams } from "../../types";
import styles from "./therapists-filters.module.scss";

interface TherapistsFiltersProps {
  filters: TherapistListParams;
  onChange: (patch: Partial<TherapistListParams>) => void;
  specialtyOptions: { value: string; label: string }[];
}

export function TherapistsFilters({
  filters,
  onChange,
  specialtyOptions,
}: TherapistsFiltersProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.search}>
        <SearchInput
          value={filters.search ?? ""}
          onChange={(v) => onChange({ search: v, page: 1 })}
          placeholder="Search by name, specialty, or phone"
        />
      </div>
      <div className={styles.select}>
        <Select
          placeholder="Specialty"
          options={specialtyOptions}
          value={filters.specialty}
          onChange={(v) =>
            onChange({ specialty: v as string | undefined, page: 1 })
          }
        />
      </div>
    </div>
  );
}
