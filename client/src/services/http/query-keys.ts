export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  dashboard: {
    summary: ["dashboard", "summary"] as const,
    capacity: ["dashboard", "capacity"] as const,
    recentPatients: (limit: number) =>
      ["dashboard", "recent-patients", limit] as const,
  },
  therapists: {
    all: ["therapists"] as const,
    list: (filters: Record<string, unknown>) =>
      ["therapists", "list", filters] as const,
    detail: (id: number) => ["therapists", "detail", id] as const,
    specialties: ["therapists", "meta", "specialties"] as const,
    scheduleExceptions: (therapistId: number, upcomingOnly: boolean) =>
      ["therapists", therapistId, "schedule-exceptions", upcomingOnly] as const,
  },
  patients: {
    all: ["patients"] as const,
    list: (filters: Record<string, unknown>) =>
      ["patients", "list", filters] as const,
    detail: (id: number) => ["patients", "detail", id] as const,
    statuses: ["patients", "meta", "statuses"] as const,
    appointments: (patientId: number, filters: Record<string, unknown>) =>
      ["patients", patientId, "appointments", filters] as const,
    invoices: (patientId: number, filters: Record<string, unknown>) =>
      ["patients", patientId, "invoices", filters] as const,
    progress: (patientId: number) =>
      ["patients", patientId, "progress"] as const,
  },
  clinicalNotes: {
    forPatient: (patientId: number, filters: Record<string, unknown>) =>
      ["clinical-notes", "patient", patientId, filters] as const,
    detail: (id: number) => ["clinical-notes", "detail", id] as const,
  },
  schedule: {
    day: (date: string, therapistId?: number) =>
      ["schedule", "day", date, therapistId ?? "all"] as const,
  },
  appointments: {
    detail: (id: number) => ["appointments", "detail", id] as const,
  },
  invoices: {
    all: ["invoices"] as const,
    list: (filters: Record<string, unknown>) =>
      ["invoices", "list", filters] as const,
    detail: (id: number) => ["invoices", "detail", id] as const,
    payments: (invoiceId: number) =>
      ["invoices", invoiceId, "payments"] as const,
  },
  billing: {
    dashboard: ["billing", "dashboard"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (filters: Record<string, unknown>) =>
      ["notifications", "list", filters] as const,
    detail: (id: number) => ["notifications", "detail", id] as const,
  },
} as const;
