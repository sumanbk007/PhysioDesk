"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import { queryKeys } from "@/services/http/query-keys";
import { fetchPatient, fetchPatients, fetchPatientStatuses } from "./api";
import type { PatientListParams } from "./types";

export function usePatients(params: PatientListParams) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.patients.list(params as Record<string, unknown>),
    queryFn: () => fetchPatients(params),
    enabled: hydrated && !!token,
    placeholderData: (prev) => prev,
  });
}

export function usePatient(id: number) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: () => fetchPatient(id),
    enabled: hydrated && !!token && id > 0,
  });
}

export function usePatientStatuses() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.patients.statuses,
    queryFn: fetchPatientStatuses,
    enabled: hydrated && !!token,
  });
}
