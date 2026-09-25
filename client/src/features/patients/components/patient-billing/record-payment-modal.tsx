"use client";

import { App } from "antd";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { Button, Input, Modal, Select } from "@/components/ui";
import { useAppForm } from "@/hooks/use-app-form";
import { formatCurrency } from "@/lib/utils";
import { useRecordPayment } from "../../mutations";
import type { InvoiceListItem, PaymentMethod } from "../../types";
import { paymentSchema, type PaymentFormData } from "./payment-schema";
import styles from "./record-payment-modal.module.scss";

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  invoice?: InvoiceListItem | null;
}

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "Cash", label: "Cash" },
  { value: "Card", label: "Card" },
  { value: "eSewa", label: "eSewa" },
  { value: "Khalti", label: "Khalti" },
  { value: "Bank Transfer", label: "Bank Transfer" },
];

const EMPTY: PaymentFormData = {
  amount: 0,
  method: "Cash",
  txn_id: "",
  last4: "",
  mobile: "",
  reference: "",
  note: "",
};

export function RecordPaymentModal({
  open,
  onClose,
  patientId,
  invoice,
}: RecordPaymentModalProps) {
  const { message } = App.useApp();
  const recordPayment = useRecordPayment(patientId, invoice?.id ?? 0);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useAppForm<typeof paymentSchema>(paymentSchema, EMPTY);

  const method = watch("method");
  const amount = watch("amount") ?? 0;

  const net = invoice
    ? Number(invoice.amount) - Number(invoice.discount)
    : 0;
  const balance = invoice ? net - Number(invoice.paid_amount) : 0;

  useEffect(() => {
    if (open) {
      reset({ ...EMPTY, amount: Math.max(0, balance) });
    }
  }, [open, balance, reset]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const details: Record<string, string> = {};
      if (data.method === "eSewa" || data.method === "Khalti") {
        if (data.txn_id) details.txn_id = data.txn_id;
        if (data.mobile) details.mobile = data.mobile;
      }
      if (data.method === "Card" && data.last4) {
        details.last4 = data.last4;
      }
      if (data.method === "Bank Transfer" && data.reference) {
        details.reference = data.reference;
      }

      const isRefund = data.amount < 0;

      await recordPayment.mutateAsync({
        amount: data.amount,
        method: data.method,
        method_details: Object.keys(details).length > 0 ? details : null,
        note: data.note || null,
      });

      message.success(isRefund ? "Refund recorded." : "Payment recorded.");
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not record the payment.";
      message.error(msg);
    }
  };

  const saving = isSubmitting || recordPayment.isPending;
  const isRefund = amount < 0;

  return (
    <Modal
      open={open}
      title={invoice ? `Record payment — ${invoice.invoice_number}` : "Record payment"}
      onCancel={onClose}
      width={520}
      heightVh={80}
      maskClosable={false}
      footer={
        <div className={styles.footer}>
          <Button variant="default" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            tone={isRefund ? "danger" : "default"}
            onClick={handleSubmit(onSubmit)}
            loading={saving}
          >
            {isRefund ? "Record refund" : "Record payment"}
          </Button>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {invoice && (
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Invoice total</span>
              <span className={styles.summaryValue}>
                {formatCurrency(invoice.amount)}
              </span>
            </div>
            {Number(invoice.discount) > 0 && (
              <div className={styles.summaryRow}>
                <span>Discount</span>
                <span className={styles.summaryValue}>
                  − {formatCurrency(invoice.discount)}
                </span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Already paid</span>
              <span className={styles.summaryValue}>
                {formatCurrency(invoice.paid_amount)}
              </span>
            </div>
            <div className={`${styles.summaryRow} ${styles.balanceRow}`}>
              <span>Balance due</span>
              <span className={styles.balanceValue}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>
        )}

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
              hint="Enter a negative amount to record a refund"
            />
          )}
        />

        <Controller
          name="method"
          control={control}
          render={({ field }) => (
            <div className={styles.field}>
              <label className={styles.label}>
                Method<span className={styles.required}>*</span>
              </label>
              <Select
                options={METHOD_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                allowClear={false}
              />
            </div>
          )}
        />

        {(method === "eSewa" || method === "Khalti") && (
          <div className={styles.row}>
            <Controller
              name="txn_id"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Transaction ID"
                  placeholder="TXN-…"
                  error={errors.txn_id?.message}
                />
              )}
            />
            <Controller
              name="mobile"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Mobile number"
                  placeholder="98xxxxxxxx"
                  error={errors.mobile?.message}
                />
              )}
            />
          </div>
        )}

        {method === "Card" && (
          <Controller
            name="last4"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Card last 4 digits"
                placeholder="1234"
                maxLength={4}
                error={errors.last4?.message}
              />
            )}
          />
        )}

        {method === "Bank Transfer" && (
          <Controller
            name="reference"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Bank reference"
                placeholder="Reference number"
                error={errors.reference?.message}
              />
            )}
          />
        )}

        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              label="Note"
              placeholder="Optional reason or comment"
              autoSize={{ minRows: 2, maxRows: 3 }}
              error={errors.note?.message}
            />
          )}
        />
      </form>
    </Modal>
  );
}
