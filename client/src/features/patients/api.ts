import { api } from "@/services/http/client";
import { clinicalNoteEndpoints, patientEndpoints } from "./endpoints";
import type {
  ClinicalNote,
  ClinicalNoteCreate,
  ClinicalNoteListParams,
  ClinicalNotePage,
  ClinicalNoteUpdate,
  Invoice,
  InvoiceListParams,
  InvoicePage,
  Patient,
  PatientCreate,
  PatientListParams,
  PatientPage,
  PatientUpdate,
  Payment,
  PaymentCreate,
  ProgressRead,
  ReportFile,
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

// ---------------- Billing ----------------

export async function fetchPatientInvoices(
  patientId: number,
  params: InvoiceListParams = {},
): Promise<InvoicePage> {
  return api.get<InvoicePage>(patientEndpoints.invoices(patientId), params);
}

export async function fetchInvoicePayments(
  invoiceId: number,
): Promise<Payment[]> {
  return api.get<Payment[]>(`/invoices/${invoiceId}/payments`);
}

export async function recordPayment(
  invoiceId: number,
  payload: PaymentCreate,
): Promise<Payment> {
  return api.post<Payment>(`/invoices/${invoiceId}/payments`, payload);
}

export async function fetchInvoice(invoiceId: number): Promise<Invoice> {
  return api.get<Invoice>(`/invoices/${invoiceId}`);
}

// ---------------- Reports ----------------

export async function fetchPatientReports(
  patientId: number,
): Promise<ReportFile[]> {
  return api.get<ReportFile[]>(patientEndpoints.reports(patientId));
}

export async function uploadReport(
  patientId: number,
  file: File,
  description?: string,
): Promise<ReportFile> {
  const formData = new FormData();
  formData.append("file", file);
  if (description) formData.append("description", description);

  return api.upload<ReportFile>(patientEndpoints.reports(patientId), formData);
}

export async function deleteReport(
  patientId: number,
  reportId: number,
): Promise<void> {
  return api.del<void>(
    `${patientEndpoints.reports(patientId)}/${reportId}`,
  );
}
