import { z } from "zod";

export const notificationSchema = z.object({
  patient_id: z
    .number({ message: "Patient is required" })
    .int()
    .positive("Patient is required"),
  type: z.enum([
    "Appointment reminder",
    "Appointment confirmation",
    "Cancellation",
    "Payment reminder",
    "Follow-up reminder",
    "Package nearing completion",
  ]),
  channel: z.enum(["SMS", "WhatsApp", "Viber", "Email", "Phone call"]),
  scheduled_for: z.string().min(1, "Scheduled time is required"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message is too long"),
});

export type NotificationFormData = z.infer<typeof notificationSchema>;
