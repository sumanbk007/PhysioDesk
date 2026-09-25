import { z } from "zod";

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Use HH:MM format");

export const therapistSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(120),
    specialty: z.string().min(1, "Specialty is required").max(120),
    phone: z.string().max(20).optional().or(z.literal("")),
    email: z
      .string()
      .email("Invalid email")
      .optional()
      .or(z.literal("")),
    qualifications: z.string().optional().or(z.literal("")),
    experience_years: z
      .number({ message: "Must be a number" })
      .int("Must be a whole number")
      .min(0, "Must be 0 or more")
      .max(80, "Must be 80 or less")
      .optional(),
    bio: z.string().optional().or(z.literal("")),
    work_days: z
      .array(
        z.enum(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]),
      )
      .min(1, "Select at least one working day"),
    start_time: timeString,
    end_time: timeString,
    slot_minutes: z
      .number()
      .int()
      .min(5, "Must be at least 5")
      .max(240, "Must be 240 or less"),
    is_active: z.boolean(),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });

export type TherapistFormData = z.infer<typeof therapistSchema>;
