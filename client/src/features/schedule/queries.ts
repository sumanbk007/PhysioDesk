"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import { queryKeys } from "@/services/http/query-keys";
import { fetchDaySchedule } from "./api";
import type { DayScheduleParams } from "./types";

function useAuthReady() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return hydrated && !!token;
}

export function useDaySchedule(params: DayScheduleParams) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.schedule.day(params.date, params.therapist_id),
    queryFn: () => fetchDaySchedule(params),
    enabled: ready && !!params.date,
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });
}
