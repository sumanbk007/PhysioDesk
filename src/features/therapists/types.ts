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

export interface TherapistListParams {
  search?: string;
  specialty?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export type TherapistPage = Page<TherapistListItem>;
