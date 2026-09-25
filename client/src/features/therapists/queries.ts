"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import { queryKeys } from "@/services/http/query-keys";
import {
  fetchTherapist,
  fetchTherapists,
  fetchTherapistSpecialties,
} from "./api";
import type { TherapistListParams } from "./types";

function useAuthReady() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return hydrated && !!token;
}

export function useTherapists(params: TherapistListParams = {}) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.therapists.list(params as Record<string, unknown>),
    queryFn: () => fetchTherapists(params),
    enabled: ready,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTherapist(id: number) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.therapists.detail(id),
    queryFn: () => fetchTherapist(id),
    enabled: ready && id > 0,
  });
}

export function useTherapistSpecialties() {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.therapists.specialties,
    queryFn: fetchTherapistSpecialties,
    enabled: ready,
    staleTime: 5 * 60 * 1000,
  });
}
