export const patientEndpoints = {
  list: "/patients",
  detail: (id: number) => `/patients/${id}`,
  statuses: "/patients/meta/statuses",
  appointments: (id: number) => `/patients/${id}/appointments`,
  invoices: (id: number) => `/patients/${id}/invoices`,
  progress: (id: number) => `/patients/${id}/progress`,
  clinicalNotes: (id: number) => `/patients/${id}/clinical-notes`,
  reports: (id: number) => `/patients/${id}/reports`,
} as const;
