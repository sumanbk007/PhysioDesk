"use client";

import { App } from "antd";
import { useState } from "react";
import Link from "next/link";
import {
  Check,
  MoreHorizontal,
  Send,
  Trash2,
  X,
} from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import {
  ActionsMenu,
  Card,
  ConfirmModal,
  EmptyState,
  StatusBadge,
  Table,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import {
  useCancelNotification,
  useDeleteNotification,
  useMarkNotificationSent,
} from "../../mutations";
import type { NotificationListItem } from "../../types";
import styles from "./notifications-table.module.scss";

interface NotificationsTableProps {
  data: NotificationListItem[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onClearFilters: () => void;
}

export function NotificationsTable({
  data,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  onClearFilters,
}: NotificationsTableProps) {
  const { message } = App.useApp();
  const markSent = useMarkNotificationSent();
  const cancel = useCancelNotification();
  const del = useDeleteNotification();

  const [confirmDelete, setConfirmDelete] = useState<NotificationListItem | null>(null);

  const handleMarkSent = async (id: number) => {
    try {
      await markSent.mutateAsync(id);
      message.success("Reminder marked as sent.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not mark as sent.";
      message.error(msg);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancel.mutateAsync(id);
      message.success("Reminder cancelled.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not cancel.";
      message.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await del.mutateAsync(confirmDelete.id);
      message.success("Reminder deleted.");
      setConfirmDelete(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete.";
      message.error(msg);
    }
  };

  const columns: ColumnsType<NotificationListItem> = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Patient",
      dataIndex: "patient_id",
      key: "patient_id",
      width: 100,
      render: (id: number) => (
        <Link href={`/patients/${id}`} className={styles.patientLink}>
          #{id}
        </Link>
      ),
    },
    {
      title: "Channel",
      dataIndex: "channel",
      key: "channel",
      width: 130,
    },
    {
      title: "Scheduled for",
      dataIndex: "scheduled_for",
      key: "scheduled_for",
      width: 180,
      render: (d: string) => (
        <span className={styles.muted}>{formatDate(d, "datetime")}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: "",
      key: "actions",
      width: 56,
      align: "right",
      render: (_, r) => {
        const isScheduled = r.status === "Scheduled";

        type MenuEntry =
          | {
              key: string;
              label: string;
              icon: React.ReactNode;
              danger?: boolean;
              onClick: () => void;
            }
          | { type: "divider"; key: string };

        const items: MenuEntry[] = [];

        if (isScheduled) {
          items.push({
            key: "mark-sent",
            label: "Mark as sent",
            icon: <Check size={14} />,
            onClick: () => handleMarkSent(r.id),
          });
          items.push({
            key: "cancel",
            label: "Cancel reminder",
            icon: <X size={14} />,
            onClick: () => handleCancel(r.id),
          });
          items.push({ type: "divider", key: "div" });
        }

        items.push({
          key: "delete",
          label: "Delete",
          icon: <Trash2 size={14} />,
          danger: true,
          onClick: () => setConfirmDelete(r),
        });

        return (
          <ActionsMenu
            trigger={
              <button
                type="button"
                className={styles.iconBtn}
                aria-label="Actions"
              >
                <MoreHorizontal size={16} />
              </button>
            }
            items={items}
          />
        );
      },
    },
  ];

  if (!loading && data.length === 0 && total === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Send size={32} />}
          title="No reminders yet"
          description="Create a reminder to notify a patient about appointments, payments, or follow-ups."
        />
      </Card>
    );
  }

  return (
    <>
      <Card padded={false}>
        <Table<NotificationListItem>
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (t, range) => `Showing ${range[0]}–${range[1]} of ${t}`,
            onChange: onPageChange,
          }}
          locale={{
            emptyText: (
              <EmptyState
                title="No reminders match these filters"
                description="Try adjusting the filters or clearing them."
                action={
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className={styles.clearBtn}
                  >
                    Clear filters
                  </button>
                }
              />
            ),
          }}
        />
      </Card>

      <ConfirmModal
        open={confirmDelete !== null}
        title="Delete this reminder?"
        description="This permanently removes the reminder. This action can't be undone."
        confirmText="Delete reminder"
        cancelText="Cancel"
        tone="danger"
        loading={del.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
