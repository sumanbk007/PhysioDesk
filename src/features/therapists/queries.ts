"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import { queryKeys } from "@/services/http/query-keys";
import { fetchTherapists } from "./api";
import type { TherapistListParams } from "./types";

export function useTherapists(params: TherapistListParams = {}) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: queryKeys.therapists.list(params as Record<string, unknown>),
    queryFn: () => fetchTherapists(params),
    enabled: hydrated && !!token,
    staleTime: 5 * 60 * 1000,
  });
}
