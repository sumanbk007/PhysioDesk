export const notificationEndpoints = {
  list: "/notifications",
  detail: (id: number) => `/notifications/${id}`,
  markSent: (id: number) => `/notifications/${id}/mark-sent`,
  cancel: (id: number) => `/notifications/${id}/cancel`,
} as const;
