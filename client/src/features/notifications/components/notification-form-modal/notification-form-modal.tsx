"use client";

import { App } from "antd";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import {
  AsyncSearchSelect,
  Button,
  DatePicker,
  Input,
  Modal,
  Select,
} from "@/components/ui";
import { useAppForm } from "@/hooks/use-app-form";
import { fetchPatients } from "@/features/patients/api";
import {
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
} from "../../constants";
import { useCreateNotification } from "../../mutations";
import { notificationSchema, type NotificationFormData } from "./schema";
import styles from "./notification-form-modal.module.scss";

interface NotificationFormModalProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY: NotificationFormData = {
  patient_id: 0,
  type: "Appointment reminder",
  channel: "SMS",
  scheduled_for: "",
  message: "",
};

export function NotificationFormModal({
  open,
  onClose,
}: NotificationFormModalProps) {
  const { message } = App.useApp();
  const create = useCreateNotification();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useAppForm<typeof notificationSchema>(notificationSchema, EMPTY);

  useEffect(() => {
    if (open) {
      reset({
        ...EMPTY,
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: NotificationFormData) => {
    try {
      await create.mutateAsync({
        patient_id: data.patient_id,
        type: data.type,
        channel: data.channel,
        scheduled_for: data.scheduled_for,
        message: data.message,
      });
      message.success("Reminder created.");
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not create the reminder.";
      message.error(msg);
    }
  };

  const saving = isSubmitting || create.isPending;

  return (
    <Modal
      open={open}
      title="New reminder"
      onCancel={onClose}
      width={560}
      heightVh={80}
      maskClosable={false}
      footer={
        <div className={styles.footer}>
          <Button variant="default" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            loading={saving}
          >
            Create reminder
          </Button>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="patient_id"
          control={control}
          render={({ field }) => (
            <AsyncSearchSelect
              label="Patient"
              required
              placeholder="Search patient by name or phone"
              value={field.value || undefined}
              onChange={(v) => field.onChange(typeof v === "number" ? v : 0)}
              onSearch={async (search) => {
                const res = await fetchPatients({
                  search,
                  page: 1,
                  page_size: 20,
                });
                return res.items.map((p) => ({
                  value: p.id,
                  label: p.name,
                  sublabel: p.phone,
                }));
              }}
              error={errors.patient_id?.message}
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <div className={styles.field}>
              <label className={styles.label}>
                Type<span className={styles.required}>*</span>
              </label>
              <Select
                options={NOTIFICATION_TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                allowClear={false}
              />
            </div>
          )}
        />

        <Controller
          name="channel"
          control={control}
          render={({ field }) => (
            <div className={styles.field}>
              <label className={styles.label}>
                Channel<span className={styles.required}>*</span>
              </label>
              <Select
                options={NOTIFICATION_CHANNEL_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                allowClear={false}
              />
            </div>
          )}
        />

        <Controller
          name="scheduled_for"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Scheduled for"
              required
              showTime
              value={field.value ? new Date(field.value).toISOString() : null}
              onChange={(iso) => field.onChange(iso ?? "")}
              error={errors.scheduled_for?.message}
            />
          )}
        />

        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              label="Message"
              required
              placeholder="e.g. Reminder: your physio appointment is tomorrow at 10:00 AM."
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={1000}
              showCount
              error={errors.message?.message}
            />
          )}
        />
      </form>
    </Modal>
  );
}
