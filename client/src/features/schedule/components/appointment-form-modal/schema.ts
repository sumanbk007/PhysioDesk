import { z } from "zod";

export const appointmentCreateSchema = z
  .object({
    patient_id: z
      .number({ message: "Patient is required" })
      .int()
      .positive("Patient is required"),
    payment_method: z
      .enum(["Cash", "Card", "eSewa", "Khalti", "Bank Transfer"])
      .optional(),
    txn_id: z.string().optional().or(z.literal("")),
    last4: z.string().max(4).optional().or(z.literal("")),
    mobile: z.string().max(20).optional().or(z.literal("")),
    reference: z.string().max(64).optional().or(z.literal("")),
    notes: z.string().max(500).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (
      (data.payment_method === "eSewa" || data.payment_method === "Khalti") &&
      !data.txn_id
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transaction ID is required",
        path: ["txn_id"],
      });
    }
  });

export type AppointmentCreateFormData = z.infer<typeof appointmentCreateSchema>;

export const appointmentRescheduleSchema = z.object({
  datetime: z.string().min(1, "Pick a new date and time"),
});

export type AppointmentRescheduleFormData = z.infer<
  typeof appointmentRescheduleSchema
>;
