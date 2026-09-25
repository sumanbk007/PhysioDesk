import { api } from "@/services/http/client";
import { scheduleEndpoints } from "./endpoints";
import type {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
  DaySchedule,
  DayScheduleParams,
} from "./types";

export async function fetchDaySchedule(
  params: DayScheduleParams,
): Promise<DaySchedule> {
  return api.get<DaySchedule>(scheduleEndpoints.day, params);
}

export async function fetchAppointment(id: number): Promise<Appointment> {
  return api.get<Appointment>(scheduleEndpoints.appointment(id));
}

export async function createAppointment(
  payload: AppointmentCreate,
): Promise<Appointment> {
  return api.post<Appointment>(scheduleEndpoints.appointments, payload);
}

export async function updateAppointment(
  id: number,
  payload: AppointmentUpdate,
): Promise<Appointment> {
  return api.patch<Appointment>(scheduleEndpoints.appointment(id), payload);
}

export async function deleteAppointment(id: number): Promise<void> {
  return api.del<void>(scheduleEndpoints.appointment(id));
}
