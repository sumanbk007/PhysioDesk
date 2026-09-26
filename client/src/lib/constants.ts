export const Gender = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const PatientStatus = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  FOLLOW_UP: "Due for follow-up",
} as const;
export type PatientStatus = (typeof PatientStatus)[keyof typeof PatientStatus];

export const AppointmentStatus = {
  BOOKED: "Booked",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
} as const;
export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const InvoiceStatus = {
  DUE: "Due",
  PARTIAL: "Partial",
  PAID: "Paid",
  REFUNDED: "Refunded",
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const PaymentMethod = {
  CASH: "Cash",
  CARD: "Card",
  ESEWA: "eSewa",
  KHALTI: "Khalti",
  BANK: "Bank Transfer",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const NotificationType = {
  APPOINTMENT_REMINDER: "Appointment reminder",
  APPOINTMENT_CONFIRMATION: "Appointment confirmation",
  CANCELLATION: "Cancellation",
  PAYMENT_REMINDER: "Payment reminder",
  FOLLOW_UP: "Follow-up reminder",
  PACKAGE_COMPLETION: "Package nearing completion",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationChannel = {
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  VIBER: "Viber",
  EMAIL: "Email",
  PHONE: "Phone call",
} as const;
export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationStatus = {
  SCHEDULED: "Scheduled",
  SENT: "Sent",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
} as const;
export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const DAY_ABBREV = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;
export type DayAbbrev = (typeof DAY_ABBREV)[number];

/** Origin of the backend API, without the /api/v1 prefix.
 * Used to build absolute URLs to static uploads. */
export const API_ORIGIN =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(
    /\/api\/v1\/?$/,
    "",
  );
