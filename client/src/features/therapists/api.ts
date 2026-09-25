import { api } from "@/services/http/client";
import { therapistEndpoints } from "./endpoints";
import type {
  Therapist,
  TherapistCreate,
  TherapistListParams,
  TherapistPage,
  TherapistUpdate,
} from "./types";

export async function fetchTherapists(
  params: TherapistListParams = {},
): Promise<TherapistPage> {
  return api.get<TherapistPage>(therapistEndpoints.list, params);
}

export async function fetchTherapist(id: number): Promise<Therapist> {
  return api.get<Therapist>(therapistEndpoints.detail(id));
}

export async function fetchTherapistSpecialties(): Promise<string[]> {
  return api.get<string[]>(therapistEndpoints.specialties);
}

export async function createTherapist(
  payload: TherapistCreate,
): Promise<Therapist> {
  return api.post<Therapist>(therapistEndpoints.list, payload);
}

export async function updateTherapist(
  id: number,
  payload: TherapistUpdate,
): Promise<Therapist> {
  return api.patch<Therapist>(therapistEndpoints.detail(id), payload);
}

export async function deleteTherapist(id: number): Promise<void> {
  return api.del<void>(therapistEndpoints.detail(id));
}
