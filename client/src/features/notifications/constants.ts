import type {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from "./types";

export const NOTIFICATION_TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: "Appointment reminder", label: "Appointment reminder" },
  { value: "Appointment confirmation", label: "Appointment confirmation" },
  { value: "Cancellation", label: "Cancellation" },
  { value: "Payment reminder", label: "Payment reminder" },
  { value: "Follow-up reminder", label: "Follow-up reminder" },
  { value: "Package nearing completion", label: "Package nearing completion" },
];

export const NOTIFICATION_CHANNEL_OPTIONS: { value: NotificationChannel; label: string }[] = [
  { value: "SMS", label: "SMS" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Viber", label: "Viber" },
  { value: "Email", label: "Email" },
  { value: "Phone call", label: "Phone call" },
];

export const NOTIFICATION_STATUS_OPTIONS: { value: NotificationStatus; label: string }[] = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "Sent", label: "Sent" },
  { value: "Failed", label: "Failed" },
  { value: "Cancelled", label: "Cancelled" },
];
