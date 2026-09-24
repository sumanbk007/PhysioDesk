"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Card, PageHeader } from "@/components/ui";
import { usePatients, usePatientStatuses } from "@/features/patients/queries";
import { PatientsFilters } from "@/features/patients/components/patients-filters";
import { PatientsTable } from "@/features/patients/components/patients-table";
import { useTherapists } from "@/features/therapists/queries";
import type {
  PatientListParams,
  PatientStatus,
} from "@/features/patients/types";

export default function PatientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: PatientListParams = useMemo(
    () => ({
      search: searchParams.get("search") ?? undefined,
      therapist_id: searchParams.get("therapist_id")
        ? Number(searchParams.get("therapist_id"))
        : undefined,
      status: (searchParams.get("status") as PatientStatus | null) ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      page_size: Number(searchParams.get("page_size") ?? "20"),
    }),
    [searchParams],
  );

  const patients = usePatients(filters);
  const statuses = usePatientStatuses();
  const therapists = useTherapists({ page: 1, page_size: 100 });

  const therapistOptions = useMemo(
    () =>
      (therapists.data?.items ?? []).map((t) => ({
        value: t.id,
        label: t.name,
      })),
    [therapists.data],
  );

  const statusOptions = useMemo(
    () =>
      (statuses.data ?? []).map((s) => ({
        value: s,
        label: s,
      })),
    [statuses.data],
  );

  const updateFilters = (patch: Partial<PatientListParams>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    router.replace(`/patients?${next.toString()}`);
  };

  const clearFilters = () => {
    router.replace("/patients");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        subtitle={
          patients.data
            ? `${patients.data.total} total`
            : "Manage patient records"
        }
      />

      <Card>
        <PatientsFilters
          filters={filters}
          onChange={updateFilters}
          therapistOptions={therapistOptions}
          statusOptions={statusOptions}
        />
      </Card>

      <PatientsTable
        data={patients.data?.items ?? []}
        total={patients.data?.total ?? 0}
        loading={patients.isLoading}
        page={filters.page ?? 1}
        pageSize={filters.page_size ?? 20}
        onPageChange={(page, pageSize) =>
          updateFilters({ page, page_size: pageSize })
        }
        onClearFilters={clearFilters}
      />
    </div>
  );
}
