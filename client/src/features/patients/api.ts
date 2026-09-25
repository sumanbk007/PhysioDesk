import { api } from "@/services/http/client";
import { clinicalNoteEndpoints, patientEndpoints } from "./endpoints";
import type {
  ClinicalNote,
  ClinicalNoteListParams,
  ClinicalNotePage,
  Patient,
  PatientCreate,
  PatientListParams,
  PatientPage,
  PatientUpdate,
} from "./types";

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
