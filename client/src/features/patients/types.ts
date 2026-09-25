import type { Page } from "@/services/http/types";

export type PatientStatus = "Active" | "Completed" | "Due for follow-up";
export type Gender = "Male" | "Female" | "Other";

export type AppointmentStatus =
  | "Booked"
  | "Completed"
  | "Cancelled"
  | "No-show";

export interface PatientListItem {
  id: number;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  condition: string;
  therapist_id: number;
  status: PatientStatus;
  sessions_total: number;
  sessions_used: number;
}

export interface Patient extends PatientListItem {
  address: string | null;
  package: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientListParams {
  search?: string;
  therapist_id?: number;
  status?: PatientStatus;
  page?: number;
  page_size?: number;
}

export interface PatientCreate {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  address?: string | null;
  condition: string;
  therapist_id: number;
  package?: string | null;
  sessions_total: number;
  sessions_used?: number;
  status?: PatientStatus;
  notes?: string | null;
}

export type PatientUpdate = Partial<PatientCreate>;

export type PatientPage = Page<PatientListItem>;

// ---------- Appointments ----------

export interface AppointmentListItem {
  id: number;
  patient_id: number;
  therapist_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
}

export interface AppointmentListParams {
  page?: number;
  page_size?: number;
}

export type AppointmentPage = Page<AppointmentListItem>;

// ---------- Clinical notes ----------

export interface ClinicalNoteListItem {
  id: number;
  patient_id: number;
  therapist_id: number;
  note_date: string;
  pain_score: number | null;
  rom_score: number | null;
  strength_score: number | null;
  milestone: string | null;
}

export interface ClinicalNote extends ClinicalNoteListItem {
  appointment_id: number | null;
  chief_complaint: string | null;
  pain_location: string | null;
  diagnosis: string | null;
  assessment: string | null;
  rom: string | null;
  strength: string | null;
  special_tests: string | null;
  treatment: string | null;
  exercises: string | null;
  patient_response: string | null;
  hep: string | null;
  plan: string | null;
  therapist_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicalNoteCreate {
  therapist_id: number;
  appointment_id?: number | null;
  note_date?: string | null;
  chief_complaint?: string | null;
  pain_location?: string | null;
  pain_score?: number | null;
  diagnosis?: string | null;
  assessment?: string | null;
  rom?: string | null;
  rom_score?: number | null;
  strength?: string | null;
  strength_score?: number | null;
  special_tests?: string | null;
  treatment?: string | null;
  exercises?: string | null;
  patient_response?: string | null;
  hep?: string | null;
  plan?: string | null;
  therapist_notes?: string | null;
  milestone?: string | null;
}

export type ClinicalNoteUpdate = Partial<ClinicalNoteCreate>;

export interface ClinicalNoteListParams {
  page?: number;
  page_size?: number;
}

export type ClinicalNotePage = Page<ClinicalNoteListItem>;

// ---------- Progress ----------

export interface ProgressPoint {
  date: string;
  value: number;
}

export interface MilestoneItem {
  date: string;
  text: string;
}

export interface ProgressRead {
  patient_id: number;
  pain: ProgressPoint[];
  rom: ProgressPoint[];
  strength: ProgressPoint[];
  milestones: MilestoneItem[];
}

// ---------- Billing ----------

export type InvoiceStatus = "Due" | "Partial" | "Paid" | "Refunded";

export type PaymentMethod = "Cash" | "Card" | "eSewa" | "Khalti" | "Bank Transfer";

export interface InvoiceListItem {
  id: number;
  invoice_number: string;
  patient_id: number;
  service: string;
  amount: string;
  discount: string;
  paid_amount: string;
  status: InvoiceStatus;
  date: string;
}

export interface Invoice extends InvoiceListItem {
  appointment_id: number | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  invoice_id: number;
  amount: string;
  method: PaymentMethod;
  method_details: Record<string, unknown> | null;
  note: string | null;
  is_refund: boolean;
  created_by: number | null;
  created_at: string;
}

export interface PaymentCreate {
  amount: number;
  method: PaymentMethod;
  method_details?: Record<string, unknown> | null;
  note?: string | null;
}

export interface InvoiceListParams {
  page?: number;
  page_size?: number;
}

export type InvoicePage = Page<InvoiceListItem>;
