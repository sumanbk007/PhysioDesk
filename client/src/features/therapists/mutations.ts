"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/http/query-keys";
import {
  createTherapist,
  deleteTherapist,
  updateTherapist,
} from "./api";
import type { TherapistCreate, TherapistUpdate } from "./types";

export function useCreateTherapist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TherapistCreate) => createTherapist(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.therapists.all });
    },
  });
}

export function useUpdateTherapist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TherapistUpdate }) =>
      updateTherapist(id, payload),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: queryKeys.therapists.all });
      qc.invalidateQueries({
        queryKey: queryKeys.therapists.detail(updated.id),
      });
    },
  });
}

export function useDeleteTherapist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTherapist(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.therapists.all });
    },
  });
}
