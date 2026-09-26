"use client";

import { SearchInput, Select } from "@/components/ui";
import { NOTIFICATION_CHANNEL_OPTIONS, NOTIFICATION_STATUS_OPTIONS, NOTIFICATION_TYPE_OPTIONS } from "../../constants";
import type { NotificationListParams } from "../../types";
import styles from "./notification-filters.module.scss";

interface NotificationFiltersProps {
  filters: NotificationListParams;
  onChange: (patch: Partial<NotificationListParams>) => void;
}

export function NotificationFilters({
  filters,
  onChange,
}: NotificationFiltersProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.select}>
        <Select
          placeholder="All types"
          options={NOTIFICATION_TYPE_OPTIONS}
          value={filters.type}
          onChange={(v) => onChange({ type: v as NotificationListParams["type"], page: 1 })}
        />
      </div>
      <div className={styles.select}>
        <Select
          placeholder="All statuses"
          options={NOTIFICATION_STATUS_OPTIONS}
          value={filters.status}
          onChange={(v) => onChange({ status: v as NotificationListParams["status"], page: 1 })}
        />
      </div>
      <div className={styles.select}>
        <Select
          placeholder="All channels"
          options={NOTIFICATION_CHANNEL_OPTIONS}
          value={filters.channel}
          onChange={(v) => onChange({ channel: v as NotificationListParams["channel"], page: 1 })}
        />
      </div>
    </div>
  );
}
