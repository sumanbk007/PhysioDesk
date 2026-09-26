import type { Page } from "@/services/http/types";
import type { InvoiceListItem } from "@/features/patients/types";

export interface BillingDashboard {
  today_revenue: string;
  pending_payments: string;
  total_patients: number;
  today_appointments: number;
}

export interface InvoiceListParams {
  search?: string;
  status?: string;
  patient_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export type InvoicePage = Page<InvoiceListItem>;
