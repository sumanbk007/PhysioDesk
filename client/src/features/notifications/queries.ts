"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import { queryKeys } from "@/services/http/query-keys";
import { fetchNotifications } from "./api";
import type { NotificationListParams } from "./types";

function useAuthReady() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  return hydrated && !!token;
}

export function useNotifications(params: NotificationListParams = {}) {
  const ready = useAuthReady();
  return useQuery({
    queryKey: queryKeys.notifications.list(params as Record<string, unknown>),
    queryFn: () => fetchNotifications(params),
    enabled: ready,
    placeholderData: (prev) => prev,
  });
}
