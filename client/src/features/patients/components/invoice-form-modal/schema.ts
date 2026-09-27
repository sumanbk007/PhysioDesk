import { z } from "zod";

export const invoiceLineItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  amount: z
    .number({ message: "Amount is required" })
    .min(0, "Amount must be 0 or more"),
  date: z.string().optional().or(z.literal("")),
});

export const invoiceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  discount: z.number().min(0, "Discount must be 0 or more"),
  line_items: z
    .array(invoiceLineItemSchema)
    .min(1, "Add at least one service"),
  notes: z.string().optional().or(z.literal("")),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
