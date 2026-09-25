import { z } from "zod";

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const optionalText = z.preprocess(emptyToNull, z.string().nullable().optional());

const optionalInt = (min: number, max: number, label: string) =>
  z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? null : Number(v)),
    z
      .number()
      .int(`${label} must be a whole number`)
      .min(min, `${label} must be at least ${min}`)
      .max(max, `${label} must be at most ${max}`)
      .nullable()
      .optional(),
  );

export const noteSchema = z.object({
  therapist_id: z
    .number({ message: "Therapist is required" })
    .int()
    .positive("Therapist is required"),

  note_date: z.string().optional().nullable(),

  chief_complaint: optionalText,
  pain_location: optionalText,
  pain_score: optionalInt(0, 10, "Pain score"),

  diagnosis: optionalText,
  assessment: optionalText,

  rom: optionalText,
  rom_score: optionalInt(0, 100, "ROM score"),

  strength: optionalText,
  strength_score: optionalInt(0, 5, "Strength score"),

  special_tests: optionalText,
  treatment: optionalText,
  exercises: optionalText,
  patient_response: optionalText,
  hep: optionalText,
  plan: optionalText,
  therapist_notes: optionalText,
  milestone: optionalText,
});

export type NoteFormData = z.infer<typeof noteSchema>;

// ---------------- Patient form (existing) ----------------

export const patientSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(120, "Name is too long"),
    age: z
      .number({ message: "Age must be a number" })
      .int("Age must be a whole number")
      .min(0, "Age must be 0 or more")
      .max(120, "Age must be 120 or less"),
    gender: z.enum(["Male", "Female", "Other"], {
      message: "Gender is required",
    }),
    phone: z.string().min(1, "Phone is required").max(20, "Phone is too long"),
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
