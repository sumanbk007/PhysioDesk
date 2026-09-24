"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/http/query-keys";
import { createPatient, deletePatient, updatePatient } from "./api";
import type { PatientCreate, PatientUpdate } from "./types";

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatientCreate) => createPatient(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
    },
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PatientUpdate }) =>
      updatePatient(id, payload),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      qc.invalidateQueries({ queryKey: queryKeys.patients.detail(updated.id) });
    },
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePatient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
    },
  });
}
