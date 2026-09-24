export interface DashboardSummary {
  date: string;
  patients_seen_today: number;
  therapists_on_duty: number;
  revenue_today: string;
  open_slots_today: number;
}

export interface CapacityEntry {
  therapist_id: number;
  therapist_name: string;
  total_slots: number;
  booked_slots: number;
  free_slots: number;
}

export interface RecentPatient {
  id: number;
  name: string;
  phone: string;
  status: string;
  therapist_id: number;
}
