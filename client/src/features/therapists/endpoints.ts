export const therapistEndpoints = {
  list: "/therapists",
  detail: (id: number) => `/therapists/${id}`,
  specialties: "/therapists/meta/specialties",
  scheduleExceptions: (id: number) =>
    `/therapists/${id}/schedule-exceptions`,
} as const;
