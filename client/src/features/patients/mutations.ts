"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/http/query-keys";
import {
  createClinicalNote,
  createPatient,
  deleteClinicalNote,
  deletePatient,
  updateClinicalNote,
  updatePatient,
} from "./api";
import type {
  ClinicalNoteCreate,
  ClinicalNoteUpdate,
  PatientCreate,
  PatientUpdate,
} from "./types";

// ---------------- Patients ----------------

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
      qc.invalidateQueries({
        queryKey: queryKeys.patients.detail(updated.id),
      });
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

// ---------------- Clinical notes ----------------

export function useCreateNote(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClinicalNoteCreate) =>
      createClinicalNote(patientId, payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.clinicalNotes.forPatient(patientId, {}),
      });
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      qc.invalidateQueries({
        queryKey: queryKeys.patients.detail(patientId),
      });
    },
  });
}

export function useUpdateNote(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ClinicalNoteUpdate }) =>
      updateClinicalNote(id, payload),
    onSuccess: (updated) => {
      qc.invalidateQueries({
        queryKey: queryKeys.clinicalNotes.forPatient(patientId, {}),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.clinicalNotes.detail(updated.id),
      });
    },
  });
}

export function useDeleteNote(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteClinicalNote(id),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.clinicalNotes.forPatient(patientId, {}),
      });
      qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      qc.invalidateQueries({
        queryKey: queryKeys.patients.detail(patientId),
      });
    },
  });
}
