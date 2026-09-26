import { api } from "@/services/http/client";
import { notificationEndpoints } from "./endpoints";
import type {
  Notification,
  NotificationCreate,
  NotificationListParams,
  NotificationPage,
} from "./types";

export async function fetchNotifications(
  params: NotificationListParams = {},
): Promise<NotificationPage> {
  return api.get<NotificationPage>(notificationEndpoints.list, params);
}

export async function createNotification(
  payload: NotificationCreate,
): Promise<Notification> {
  return api.post<Notification>(notificationEndpoints.list, payload);
}

export async function markNotificationSent(id: number): Promise<Notification> {
  return api.post<Notification>(notificationEndpoints.markSent(id));
}

export async function cancelNotification(id: number): Promise<Notification> {
  return api.post<Notification>(notificationEndpoints.cancel(id));
}

export async function deleteNotification(id: number): Promise<void> {
  return api.del<void>(notificationEndpoints.detail(id));
}
