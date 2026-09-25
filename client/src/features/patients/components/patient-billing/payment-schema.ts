import { z } from "zod";

export const paymentSchema = z
  .object({
    amount: z
      .number({ message: "Amount is required" })
      .refine((v) => v !== 0, "Amount cannot be zero"),
    method: z.enum(["Cash", "Card", "eSewa", "Khalti", "Bank Transfer"]),
    txn_id: z.string().optional().or(z.literal("")),
    last4: z
      .string()
      .max(4)
      .regex(/^\d*$/, "Digits only")
      .optional()
      .or(z.literal("")),
    mobile: z.string().max(20).optional().or(z.literal("")),
    reference: z.string().max(64).optional().or(z.literal("")),
    note: z.string().max(255).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (
      (data.method === "eSewa" || data.method === "Khalti") &&
      !data.txn_id
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transaction ID is required",
        path: ["txn_id"],
      });
    }
    if (data.method === "Card" && data.last4 && data.last4.length !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter the last 4 digits",
        path: ["last4"],
      });
    }
  });

export type PaymentFormData = z.infer<typeof paymentSchema>;
