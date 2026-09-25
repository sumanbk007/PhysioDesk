"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import { queryKeys } from "@/services/http/query-keys";
import { api } from "@/services/http/client";
import {
  fetchClinicalNote,
  fetchInvoicePayments,
  fetchPatient,
  fetchPatientInvoices,
  fetchPatientNotes,
  fetchPatientProgress,
  fetchPatients,
  fetchPatientStatuses,
} from "./api";
import { patientEndpoints } from "./endpoints";
import type {
  AppointmentListParams,
  AppointmentPage,
  ClinicalNoteListParams,
  InvoiceListParams,
  PatientListParams,
} from "./types";

function useAuthReady() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return hydrated && !!token;
}

export function usePatients(params: PatientListParams) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.patients.list(params as Record<string, unknown>),
    queryFn: () => fetchPatients(params),
    enabled: ready,
    placeholderData: (prev) => prev,
  });
}

export function usePatient(id: number) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: () => fetchPatient(id),
    enabled: ready && id > 0,
  });
}

export function usePatientStatuses() {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.patients.statuses,
    queryFn: fetchPatientStatuses,
    enabled: ready,
  });
}

export function usePatientAppointments(
  patientId: number,
  params: AppointmentListParams = {},
) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.patients.appointments(
      patientId,
      params as Record<string, unknown>,
    ),
    queryFn: () =>
      api.get<AppointmentPage>(patientEndpoints.appointments(patientId), params),
    enabled: ready && patientId > 0,
    placeholderData: (prev) => prev,
  });
}

export function usePatientNotes(
  patientId: number,
  params: ClinicalNoteListParams = {},
) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.clinicalNotes.forPatient(
      patientId,
      params as Record<string, unknown>,
    ),
    queryFn: () => fetchPatientNotes(patientId, params),
    enabled: ready && patientId > 0,
    placeholderData: (prev) => prev,
  });
}

export function useClinicalNote(noteId: number) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.clinicalNotes.detail(noteId),
    queryFn: () => fetchClinicalNote(noteId),
    enabled: ready && noteId > 0,
  });
}

export function usePatientProgress(patientId: number) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.patients.progress(patientId),
    queryFn: () => fetchPatientProgress(patientId),
    enabled: ready && patientId > 0,
  });
}

export function usePatientInvoices(
  patientId: number,
  params: InvoiceListParams = {},
) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.patients.invoices(
      patientId,
      params as Record<string, unknown>,
    ),
    queryFn: () => fetchPatientInvoices(patientId, params),
    enabled: ready && patientId > 0,
    placeholderData: (prev) => prev,
  });
}

export function useInvoicePayments(invoiceId: number) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.invoices.payments(invoiceId),
    queryFn: () => fetchInvoicePayments(invoiceId),
    enabled: ready && invoiceId > 0,
  });
}
