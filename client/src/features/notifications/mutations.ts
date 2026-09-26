"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/http/query-keys";
import {
  cancelNotification,
  createNotification,
  deleteNotification,
  markNotificationSent,
} from "./api";
import type { NotificationCreate } from "./types";

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
  };
}

export function useCreateNotification() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: NotificationCreate) => createNotification(payload),
    onSuccess: invalidate,
  });
}

export function useMarkNotificationSent() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => markNotificationSent(id),
    onSuccess: invalidate,
  });
}

export function useCancelNotification() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => cancelNotification(id),
    onSuccess: invalidate,
  });
}

export function useDeleteNotification() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: invalidate,
  });
}
