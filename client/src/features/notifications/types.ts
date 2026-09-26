import type { Page } from "@/services/http/types";

export type NotificationType =
  | "Appointment reminder"
  | "Appointment confirmation"
  | "Cancellation"
  | "Payment reminder"
  | "Follow-up reminder"
  | "Package nearing completion";

export type NotificationChannel =
  | "SMS"
  | "WhatsApp"
  | "Viber"
  | "Email"
  | "Phone call";

export type NotificationStatus =
  | "Scheduled"
  | "Sent"
  | "Failed"
  | "Cancelled";

export interface NotificationListItem {
  id: number;
  patient_id: number;
  type: NotificationType;
  channel: NotificationChannel;
  scheduled_for: string;
  status: NotificationStatus;
  message: string;
}

export interface Notification extends NotificationListItem {
  sent_at: string | null;
  related_appointment_id: number | null;
  related_invoice_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationCreate {
  patient_id: number;
  type: NotificationType;
  channel: NotificationChannel;
  scheduled_for: string;
  message: string;
  related_appointment_id?: number | null;
  related_invoice_id?: number | null;
}

export interface NotificationListParams {
  type?: NotificationType;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  patient_id?: number;
  page?: number;
  page_size?: number;
}

export type NotificationPage = Page<NotificationListItem>;
