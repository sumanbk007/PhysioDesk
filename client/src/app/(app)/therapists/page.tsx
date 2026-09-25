"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button, Card, PageHeader } from "@/components/ui";
import {
  useTherapists,
  useTherapistSpecialties,
} from "@/features/therapists/queries";
import { TherapistsFilters } from "@/features/therapists/components/therapists-filters";
import { TherapistsTable } from "@/features/therapists/components/therapists-table";
import { TherapistFormModal } from "@/features/therapists/components/therapist-form-modal";
import type { TherapistListParams } from "@/features/therapists/types";

export default function TherapistsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);

  const filters: TherapistListParams = useMemo(
    () => ({
      search: searchParams.get("search") ?? undefined,
      specialty: searchParams.get("specialty") ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      page_size: Number(searchParams.get("page_size") ?? "20"),
    }),
    [searchParams],
  );

  const therapists = useTherapists(filters);
  const specialties = useTherapistSpecialties();

  const specialtyOptions = useMemo(
    () =>
      (specialties.data ?? []).map((s) => ({ value: s, label: s })),
    [specialties.data],
  );

  const updateFilters = (patch: Partial<TherapistListParams>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    router.replace(`/therapists?${next.toString()}`);
  };

  const clearFilters = () => router.replace("/therapists");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Therapists"
        subtitle={
          therapists.data
            ? `${therapists.data.total} total`
            : "Manage therapist records"
        }
        action={
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => setFormOpen(true)}
          >
            Add therapist
          </Button>
        }
      />

      <Card>
        <TherapistsFilters
          filters={filters}
          onChange={updateFilters}
          specialtyOptions={specialtyOptions}
        />
      </Card>

      <TherapistsTable
        data={therapists.data?.items ?? []}
        total={therapists.data?.total ?? 0}
        loading={therapists.isLoading}
        page={filters.page ?? 1}
        pageSize={filters.page_size ?? 20}
        onPageChange={(page, pageSize) =>
          updateFilters({ page, page_size: pageSize })
        }
        onClearFilters={clearFilters}
      />

      <TherapistFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
