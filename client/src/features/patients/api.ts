import { api } from "@/services/http/client";
import { clinicalNoteEndpoints, patientEndpoints } from "./endpoints";
import type {
  ClinicalNote,
  ClinicalNoteCreate,
  ClinicalNoteListParams,
  ClinicalNotePage,
  ClinicalNoteUpdate,
  Patient,
  PatientCreate,
  PatientListParams,
  PatientPage,
  PatientUpdate,
  ProgressRead,
} from "./types";

// ---------------- Patients ----------------

export async function fetchPatients(
  params: PatientListParams,
): Promise<PatientPage> {
  return api.get<PatientPage>(patientEndpoints.list, params);
}

export async function fetchPatient(id: number): Promise<Patient> {
  return api.get<Patient>(patientEndpoints.detail(id));
}

export async function fetchPatientStatuses(): Promise<string[]> {
  return api.get<string[]>(patientEndpoints.statuses);
}

export async function createPatient(payload: PatientCreate): Promise<Patient> {
  return api.post<Patient>(patientEndpoints.list, payload);
}

export async function updatePatient(
  id: number,
  payload: PatientUpdate,
): Promise<Patient> {
  return api.patch<Patient>(patientEndpoints.detail(id), payload);
}

export async function deletePatient(id: number): Promise<void> {
  return api.del<void>(patientEndpoints.detail(id));
}

// ---------------- Clinical notes ----------------

export async function fetchPatientNotes(
  patientId: number,
  params: ClinicalNoteListParams = {},
): Promise<ClinicalNotePage> {
  return api.get<ClinicalNotePage>(
    patientEndpoints.clinicalNotes(patientId),
    params,
  );
}

export async function fetchClinicalNote(noteId: number): Promise<ClinicalNote> {
  return api.get<ClinicalNote>(clinicalNoteEndpoints.detail(noteId));
}

export async function createClinicalNote(
  patientId: number,
  payload: ClinicalNoteCreate,
): Promise<ClinicalNote> {
  return api.post<ClinicalNote>(
    patientEndpoints.clinicalNotes(patientId),
    payload,
  );
}

export async function updateClinicalNote(
  noteId: number,
  payload: ClinicalNoteUpdate,
): Promise<ClinicalNote> {
  return api.patch<ClinicalNote>(clinicalNoteEndpoints.detail(noteId), payload);
}

export async function deleteClinicalNote(noteId: number): Promise<void> {
  return api.del<void>(clinicalNoteEndpoints.detail(noteId));
}

// ---------------- Progress ----------------

export async function fetchPatientProgress(
  patientId: number,
): Promise<ProgressRead> {
  return api.get<ProgressRead>(patientEndpoints.progress(patientId));
}
