export const scheduleEndpoints = {
  day: "/schedule",
  appointments: "/appointments",
  appointment: (id: number) => `/appointments/${id}`,
} as const;
