export interface SlotRead {
  start_time: string;
  end_time: string;
  is_booked: boolean;
  appointment_id: number | null;
  patient_id: number | null;
  patient_name: string | null;
  status: string | null;
}

export interface TherapistDaySchedule {
  therapist_id: number;
  therapist_name: string;
  is_off: boolean;
  override_reason: string | null;
  working_hours: [string, string] | null;
  slot_minutes: number;
  total_slots: number;
  booked_slots: number;
  free_slots: number;
  slots: SlotRead[];
}

export interface DaySchedule {
  date: string;
  therapists: TherapistDaySchedule[];
}

export interface DayScheduleParams {
  date: string;
  therapist_id?: number;
}

export interface AppointmentCreate {
  patient_id: number;
  therapist_id: number;
  date: string;
  start_time: string;
  end_time: string;
  payment_method?: string | null;
  payment_details?: Record<string, unknown> | null;
  notes?: string | null;
}

export interface AppointmentUpdate {
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  payment_method?: string | null;
  payment_details?: Record<string, unknown> | null;
  notes?: string | null;
}

export interface Appointment {
  id: number;
  patient_id: number;
  therapist_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_method: string | null;
  payment_details: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
