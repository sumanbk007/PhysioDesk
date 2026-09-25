import type { Page } from "@/services/http/types";

export interface TherapistListItem {
  id: number;
  name: string;
  specialty: string;
  phone: string | null;
  email: string | null;
  experience_years: number | null;
  is_active: boolean;
}

export type WorkDay = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export interface Therapist {
  id: number;
  name: string;
  specialty: string;
  phone: string | null;
  email: string | null;
  qualifications: string | null;
  experience_years: number | null;
  bio: string | null;
  avatar_url: string | null;
  work_days: WorkDay[];
  start_time: string;
  end_time: string;
  slot_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TherapistListParams {
  search?: string;
  specialty?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface TherapistCreate {
  name: string;
  specialty: string;
  phone?: string | null;
  email?: string | null;
  qualifications?: string | null;
  experience_years?: number | null;
  bio?: string | null;
  avatar_url?: string | null;
  work_days: WorkDay[];
  start_time: string;
  end_time: string;
  slot_minutes?: number;
  is_active?: boolean;
}

export type TherapistUpdate = Partial<TherapistCreate>;

export type TherapistPage = Page<TherapistListItem>;
