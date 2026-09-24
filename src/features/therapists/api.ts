import { api } from "@/services/http/client";
import { therapistEndpoints } from "./endpoints";
import type { TherapistListParams, TherapistPage } from "./types";

export async function fetchTherapists(
  params: TherapistListParams,
): Promise<TherapistPage> {
  return api.get<TherapistPage>(therapistEndpoints.list, params);
}
