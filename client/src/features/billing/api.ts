import { api } from "@/services/http/client";
import type { InvoiceListItem } from "@/features/patients/types";
import { billingEndpoints } from "./endpoints";
import type { BillingDashboard, InvoiceListParams, InvoicePage } from "./types";

export async function fetchBillingDashboard(): Promise<BillingDashboard> {
  return api.get<BillingDashboard>(billingEndpoints.dashboard);
}

export async function fetchAllInvoices(
  params: InvoiceListParams = {},
): Promise<InvoicePage> {
  return api.get<InvoicePage>(billingEndpoints.invoices, params);
}

export async function fetchAllInvoiceStatuses(): Promise<string[]> {
  // The backend doesn't have a dedicated status list endpoint yet.
  // Hardcode the known values — matches the InvoiceStatus enum.
  return ["Due", "Partial", "Paid", "Refunded"];
}

// Re-export for convenience
export type { InvoiceListItem };
