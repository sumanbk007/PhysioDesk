"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import { queryKeys } from "@/services/http/query-keys";
import { fetchCapacity, fetchDashboardSummary, fetchRecentPatients } from "./api";

export function useDashboardSummary() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: fetchDashboardSummary,
    enabled: hydrated && !!token,
  });
}

export function useCapacity() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.dashboard.capacity,
    queryFn: fetchCapacity,
    enabled: hydrated && !!token,
  });
}

export function useRecentPatients(limit = 5) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.dashboard.recentPatients(limit),
    queryFn: () => fetchRecentPatients(limit),
    enabled: hydrated && !!token,
  });
}
