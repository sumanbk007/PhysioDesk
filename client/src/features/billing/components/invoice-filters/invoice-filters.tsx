"use client";

import { SearchInput, Select } from "@/components/ui";
import type { InvoiceListParams } from "../../types";
import styles from "./invoice-filters.module.scss";

interface InvoiceFiltersProps {
  filters: InvoiceListParams;
  onChange: (patch: Partial<InvoiceListParams>) => void;
  statusOptions: { value: string; label: string }[];
  patientOptions: { value: number; label: string }[];
}

export function InvoiceFilters({
  filters,
  onChange,
  statusOptions,
  patientOptions,
}: InvoiceFiltersProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.search}>
        <SearchInput
          value={filters.search ?? ""}
          onChange={(v) => onChange({ search: v, page: 1 })}
          placeholder="Search invoice number or service"
        />
      </div>

      <div className={styles.select}>
        <Select
          placeholder="Status"
          options={statusOptions}
          value={filters.status}
          onChange={(v) =>
            onChange({ status: v as string | undefined, page: 1 })
          }
        />
      </div>

      <div className={styles.select}>
        <Select
          placeholder="Patient"
          options={patientOptions}
          value={filters.patient_id}
          onChange={(v) =>
            onChange({ patient_id: v as number | undefined, page: 1 })
          }
        />
      </div>
    </div>
  );
}
