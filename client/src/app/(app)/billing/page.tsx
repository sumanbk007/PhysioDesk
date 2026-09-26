"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, PageHeader } from "@/components/ui";
import { BillingStats } from "@/features/billing/components/billing-stats";
import { InvoiceFilters } from "@/features/billing/components/invoice-filters";
import { InvoicesTable } from "@/features/billing/components/invoices-table";
import { useAllInvoices, useBillingDashboard } from "@/features/billing/queries";
import { usePatients } from "@/features/patients/queries";
import type { InvoiceListParams } from "@/features/billing/types";
import styles from "./billing.module.scss";

const STATUS_OPTIONS = [
  { value: "Due", label: "Due" },
  { value: "Partial", label: "Partial" },
  { value: "Paid", label: "Paid" },
  { value: "Refunded", label: "Refunded" },
];

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: InvoiceListParams = useMemo(
    () => ({
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      patient_id: searchParams.get("patient_id")
        ? Number(searchParams.get("patient_id"))
        : undefined,
      page: Number(searchParams.get("page") ?? "1"),
      page_size: Number(searchParams.get("page_size") ?? "20"),
    }),
    [searchParams],
  );

  const dashboard = useBillingDashboard();
  const invoices = useAllInvoices(filters);
  const patients = usePatients({ page: 1, page_size: 200 });

  const patientOptions = useMemo(
    () =>
      (patients.data?.items ?? []).map((p) => ({
        value: p.id,
        label: p.name,
      })),
    [patients.data],
  );

  const updateFilters = (patch: Partial<InvoiceListParams>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    router.replace(`/billing?${next.toString()}`);
  };

  const clearFilters = () => router.replace("/billing");

  return (
    <div className={styles.page}>
      <PageHeader
        title="Billing"
        subtitle="Invoices, payments, and revenue at a glance"
      />

      <BillingStats
        data={dashboard.data}
        loading={dashboard.isLoading || dashboard.isError}
      />

      <Card>
        <InvoiceFilters
          filters={filters}
          onChange={updateFilters}
          statusOptions={STATUS_OPTIONS}
          patientOptions={patientOptions}
        />
      </Card>

      <InvoicesTable
        data={invoices.data?.items ?? []}
        total={invoices.data?.total ?? 0}
        loading={invoices.isLoading}
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
