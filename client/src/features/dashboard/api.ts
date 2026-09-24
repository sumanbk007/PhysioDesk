import { api } from "@/services/http/client";
import { dashboardEndpoints } from "./endpoints";
import type { CapacityEntry, DashboardSummary, RecentPatient } from "./types";

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return api.get<DashboardSummary>(dashboardEndpoints.summary);
}

export async function fetchCapacity(): Promise<CapacityEntry[]> {
  return api.get<CapacityEntry[]>(dashboardEndpoints.capacity);
}

export async function fetchRecentPatients(limit = 5): Promise<RecentPatient[]> {
  return api.get<RecentPatient[]>(dashboardEndpoints.recentPatients, { limit });
}
