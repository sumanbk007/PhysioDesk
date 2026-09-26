"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button, Card, PageHeader } from "@/components/ui";
import { NotificationFilters } from "@/features/notifications/components/notification-filters";
import { NotificationsTable } from "@/features/notifications/components/notifications-table";
import { NotificationFormModal } from "@/features/notifications/components/notification-form-modal";
import { useNotifications } from "@/features/notifications/queries";
import type { NotificationListParams } from "@/features/notifications/types";
import styles from "./notifications.module.scss";

export default function NotificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);

  const filters: NotificationListParams = useMemo(
    () => ({
      type: (searchParams.get("type") as NotificationListParams["type"]) ?? undefined,
      status: (searchParams.get("status") as NotificationListParams["status"]) ?? undefined,
      channel: (searchParams.get("channel") as NotificationListParams["channel"]) ?? undefined,
      page: Number(searchParams.get("page") ?? "1"),
      page_size: Number(searchParams.get("page_size") ?? "20"),
    }),
    [searchParams],
  );

  const notifications = useNotifications(filters);

  const updateFilters = (patch: Partial<NotificationListParams>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || (v as unknown) === "") {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    router.replace(`/notifications?${next.toString()}`);
  };

  const clearFilters = () => router.replace("/notifications");

  return (
    <div className={styles.page}>
      <PageHeader
        title="Notifications"
        subtitle={
          notifications.data
            ? `${notifications.data.total} ${notifications.data.total === 1 ? "reminder" : "reminders"}`
            : "Reminders and confirmation messages"
        }
        action={
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => setFormOpen(true)}
          >
            New reminder
          </Button>
        }
      />

      <Card>
        <NotificationFilters filters={filters} onChange={updateFilters} />
      </Card>

      <NotificationsTable
        data={notifications.data?.items ?? []}
        total={notifications.data?.total ?? 0}
        loading={notifications.isLoading}
        page={filters.page ?? 1}
        pageSize={filters.page_size ?? 20}
        onPageChange={(page, pageSize) =>
          updateFilters({ page, page_size: pageSize })
        }
        onClearFilters={clearFilters}
      />

      <NotificationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}
