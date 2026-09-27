"use client";

import { App } from "antd";
import { useEffect } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button, DatePicker, Input, Modal } from "@/components/ui";
import { useAppForm } from "@/hooks/use-app-form";
import { formatCurrency } from "@/lib/utils";
import { useCreateInvoice } from "../../mutations";
import { invoiceSchema, type InvoiceFormData } from "./schema";
import styles from "./invoice-form-modal.module.scss";

interface InvoiceFormModalProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  onCreated?: (invoiceId: number) => void;
}

const EMPTY: InvoiceFormData = {
  date: "",
  discount: 0,
  line_items: [{ title: "", amount: 0, date: "" }],
  notes: "",
};

export function InvoiceFormModal({
  open,
  onClose,
  patientId,
  onCreated,
}: InvoiceFormModalProps) {
  const { message } = App.useApp();
  const create = useCreateInvoice(patientId);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useAppForm<typeof invoiceSchema>(invoiceSchema, EMPTY);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "line_items",
  });

  const lineItems = watch("line_items");
  const discount = watch("discount") ?? 0;

  const subtotal = (lineItems ?? []).reduce(
    (sum, item) => sum + (Number(item?.amount) || 0),
    0,
  );
  const total = Math.max(0, subtotal - (Number(discount) || 0));

  useEffect(() => {
    if (open) {
      reset({
        ...EMPTY,
        date: new Date().toISOString(),
        line_items: [{ title: "", amount: 0, date: "" }],
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const invoice = await create.mutateAsync({
        patient_id: patientId,
        date: data.date ? data.date.slice(0, 10) : undefined,
        discount: data.discount,
        notes: data.notes || null,
        line_items: data.line_items.map((it) => ({
          title: it.title,
          amount: it.amount,
          date: it.date ? it.date.slice(0, 10) : null,
        })),
      });
      message.success(`Invoice ${invoice.invoice_number} created.`);
      onCreated?.(invoice.id);
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not create the invoice.";
      message.error(msg);
    }
  };

  const saving = isSubmitting || create.isPending;

  return (
    <Modal
      open={open}
      title="New invoice"
      onCancel={onClose}
      width={720}
      heightVh={85}
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
            Create invoice
          </Button>
        </div>
      }
    >
      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className={styles.row}>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Invoice date"
                required
                value={field.value ? new Date(field.value).toISOString() : null}
                onChange={(iso) => field.onChange(iso ?? "")}
                error={errors.date?.message}
              />
            )}
          />
          <Controller
            name="discount"
            control={control}
            render={({ field }) => (
              <Input
                label="Discount"
                type="number"
                value={field.value === 0 ? "" : String(field.value)}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                onBlur={field.onBlur}
                error={errors.discount?.message}
              />
            )}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Services</span>
            <Button
              variant="default"
              size="small"
              icon={<Plus size={13} />}
              onClick={() =>
                append({
                  title: "",
                  amount: 0,
                  date: new Date().toISOString().slice(0, 10),
                })
              }
            >
              Add service
            </Button>
          </div>

          <div className={styles.itemsTable}>
            {fields.map((field, index) => (
              <div key={field.id} className={styles.itemRow}>
                <Controller
                  name={`line_items.${index}.title` as const}
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Service"
                      placeholder="e.g. X-ray, blood test"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.line_items?.[index]?.title?.message}
                    />
                  )}
                />

                <Controller
                  name={`line_items.${index}.amount` as const}
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Amount"
                      placeholder="0"
                      type="number"
                      value={field.value === 0 ? "" : String(field.value)}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                      onBlur={field.onBlur}
                      error={errors.line_items?.[index]?.amount?.message}
                    />
                  )}
                />

                <Controller
                  name={`line_items.${index}.date` as const}
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Date"
                      value={
                        field.value ? new Date(field.value).toISOString() : null
                      }
                      onChange={(iso) => field.onChange(iso ?? "")}
                    />
                  )}
                />

                <button
                  type="button"
                  className={styles.removeItem}
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  aria-label="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {errors.line_items &&
            typeof errors.line_items.message === "string" && (
              <div className={styles.error}>{errors.line_items.message}</div>
            )}
        </div>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Discount</span>
            <span>− {formatCurrency(discount)}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.grandTotal}`}>
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              label="Notes"
              placeholder="Optional notes about this invoice"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          )}
        />
      </form>
    </Modal>
  );
}
