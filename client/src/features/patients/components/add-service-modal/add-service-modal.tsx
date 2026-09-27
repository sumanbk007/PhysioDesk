"use client";

import { App } from "antd";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";
import { Button, DatePicker, Input, Modal } from "@/components/ui";
import { useAppForm } from "@/hooks/use-app-form";
import { useAddInvoiceItem } from "../../mutations";
import styles from "./add-service-modal.module.scss";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  amount: z
    .number({ message: "Amount is required" })
    .min(0, "Amount must be 0 or more"),
  date: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface AddServiceModalProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  invoiceId: number;
}

const EMPTY: FormData = { title: "", amount: 0, date: "" };

export function AddServiceModal({
  open,
  onClose,
  patientId,
  invoiceId,
}: AddServiceModalProps) {
  const { message } = App.useApp();
  const addItem = useAddInvoiceItem(patientId, invoiceId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useAppForm<typeof schema>(schema, EMPTY);

  useEffect(() => {
    if (open) {
      reset({
        title: "",
        amount: 0,
        date: new Date().toISOString(),
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await addItem.mutateAsync({
        title: data.title,
        amount: data.amount,
        date: data.date ? data.date.slice(0, 10) : null,
      });
      message.success("Service added.");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not add the service.";
      message.error(msg);
    }
  };

  const saving = isSubmitting || addItem.isPending;

  return (
    <Modal
      open={open}
      title="Add service"
      onCancel={onClose}
      width={480}
      heightVh={60}
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
            Add service
          </Button>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Title"
              placeholder="e.g. Chest X-ray, CBC blood test"
              required
              error={errors.title?.message}
            />
          )}
        />
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Input
              label="Amount"
              type="number"
              required
              value={field.value === 0 ? "" : String(field.value)}
              onChange={(e) =>
                field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
              }
              onBlur={field.onBlur}
              error={errors.amount?.message}
            />
          )}
        />
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Date"
              value={field.value ? new Date(field.value).toISOString() : null}
              onChange={(iso) => field.onChange(iso ?? "")}
            />
          )}
        />
      </form>
    </Modal>
  );
}
