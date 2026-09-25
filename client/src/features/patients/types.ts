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

// ---------- Appointments (used on Sessions tab + Overview) ----------

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
