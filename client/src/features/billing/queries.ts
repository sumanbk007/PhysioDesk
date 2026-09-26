"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import { queryKeys } from "@/services/http/query-keys";
import { fetchAllInvoices, fetchBillingDashboard } from "./api";
import type { InvoiceListParams } from "./types";

function useAuthReady() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return hydrated && !!token;
}

export function useBillingDashboard() {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.billing.dashboard,
    queryFn: fetchBillingDashboard,
    enabled: ready,
  });
}

export function useAllInvoices(params: InvoiceListParams = {}) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: ["invoices", "list", params],
    queryFn: () => fetchAllInvoices(params),
    enabled: ready,
    placeholderData: (prev) => prev,
  });
}
