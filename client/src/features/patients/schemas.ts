import { z } from "zod";

export const patientSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  age: z
    .number({ message: "Age must be a number" })
    .int("Age must be a whole number")
    .min(0, "Age must be 0 or more")
    .max(120, "Age must be 120 or less"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Gender is required",
  }),
  phone: z
    .string()
    .min(1, "Phone is required")
    .max(20, "Phone is too long"),
  address: z
    .string()
    .max(255, "Address is too long")
    .optional()
    .or(z.literal("")),
  condition: z
    .string()
    .min(1, "Condition is required")
    .max(255, "Condition is too long"),
  therapist_id: z
    .number({ message: "Therapist is required" })
    .int()
    .positive("Therapist is required"),
  package: z
    .string()
    .max(120, "Package is too long")
    .optional()
    .or(z.literal("")),
  sessions_total: z
    .number({ message: "Sessions total is required" })
    .int("Must be a whole number")
    .min(0, "Must be 0 or more")
    .max(1000, "Too many sessions"),
  sessions_used: z
    .number()
    .int("Must be a whole number")
    .min(0, "Must be 0 or more")
    .max(1000, "Too many sessions"),
  status: z.enum(["Active", "Completed", "Due for follow-up"]),
  notes: z.string().optional().or(z.literal("")),
})
.superRefine((data, ctx) => {
  if (data.sessions_used > data.sessions_total) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Sessions used cannot exceed sessions total",
      path: ["sessions_used"],
    });
  }
});

export type PatientFormData = z.infer<typeof patientSchema>;
