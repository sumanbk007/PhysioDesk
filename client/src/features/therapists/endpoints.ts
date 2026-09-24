export const therapistEndpoints = {
  list: "/therapists",
  detail: (id: number) => `/therapists/${id}`,
  specialties: "/therapists/meta/specialties",
} as const;
