"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/http/query-keys";
import {
  createAppointment,
  deleteAppointment,
  updateAppointment,
} from "./api";
import type { AppointmentCreate, AppointmentUpdate } from "./types";

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["schedule"] });
    qc.invalidateQueries({ queryKey: queryKeys.patients.all });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useBookAppointment() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (payload: AppointmentCreate) => createAppointment(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateAppointment() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AppointmentUpdate }) =>
      updateAppointment(id, payload),
    onSuccess: invalidate,
  });
}

export function useCancelAppointment() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (id: number) => deleteAppointment(id),
    onSuccess: invalidate,
  });
}
