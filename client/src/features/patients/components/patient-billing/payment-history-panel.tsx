"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { App } from "antd";
import { Button, EmptyState, PageLoader } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useInvoicePayments } from "../../queries";
import { useRemoveInvoiceItem } from "../../mutations";
import { AddServiceModal } from "../add-service-modal";
import type { InvoiceListItem } from "../../types";
import styles from "./payment-history-panel.module.scss";

interface PaymentHistoryPanelProps {
  invoice: InvoiceListItem;
  patientId: number;
  onRecordPayment: (invoiceId: number) => void;
}

export function PaymentHistoryPanel({
  invoice,
  patientId,
  onRecordPayment,
}: PaymentHistoryPanelProps) {
  const { message } = App.useApp();
  const payments = useInvoicePayments(invoice.id);
  const removeItem = useRemoveInvoiceItem(patientId, invoice.id);
  const [addOpen, setAddOpen] = useState(false);

  const lineItems = invoice.line_items ?? [];
  const netDue = Number(invoice.amount) - Number(invoice.discount);
  const balance = netDue - Number(invoice.paid_amount);

  const handleRemoveItem = async (index: number) => {
    try {
      await removeItem.mutateAsync(index);
      message.success("Service removed.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not remove the service.";
      message.error(msg);
    }
  };

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Services</span>
            <Button
              variant="default"
              size="small"
              icon={<Plus size={13} />}
              onClick={(e) => {
                e.stopPropagation();
                setAddOpen(true);
              }}
            >
              Add service
            </Button>
          </div>

          {lineItems.length === 0 ? (
            <div className={styles.noItems}>
              No line items — invoice shows a single service.
            </div>
          ) : (
            <ul className={styles.itemList}>
              {lineItems.map((item, index) => (
                <li key={index} className={styles.item}>
                  <span className={styles.itemTitle}>{item.title}</span>
                  <span className={styles.itemDate}>
                    {item.date ? formatDate(item.date, "short") : ""}
                  </span>
                  <span className={styles.itemAmount}>
                    {formatCurrency(item.amount)}
                  </span>
                  <button
                    type="button"
                    className={styles.itemRemove}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(index);
                    }}
                    aria-label="Remove service"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.amount)}</span>
            </div>
            {Number(invoice.discount) > 0 && (
              <div className={styles.totalRow}>
                <span>Discount</span>
                <span>− {formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className={styles.totalRow}>
              <span>Paid</span>
              <span>{formatCurrency(invoice.paid_amount)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.balanceRow}`}>
              <span>Balance</span>
              <span>{formatCurrency(Math.max(0, balance))}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Payment history</span>
            <Button
              variant="default"
              size="small"
              icon={<Plus size={13} />}
              onClick={(e) => {
                e.stopPropagation();
                onRecordPayment(invoice.id);
              }}
            >
              Record payment
            </Button>
          </div>

          {payments.isLoading ? (
            <PageLoader label="Loading payments..." />
          ) : !payments.data || payments.data.length === 0 ? (
            <EmptyState
              title="No payments yet"
              description="Record a payment to see it here."
            />
          ) : (
            <ul className={styles.paymentList}>
              {payments.data.map((p) => (
                <li key={p.id} className={styles.payment}>
                  <div className={styles.paymentLeft}>
                    <span className={styles.paymentMethod}>{p.method}</span>
                    <span className={styles.paymentDate}>
                      {formatDate(p.created_at, "datetime")}
                    </span>
                    {p.note && <span className={styles.paymentNote}>{p.note}</span>}
                  </div>
                  <div
                    className={`${styles.paymentAmount} ${
                      p.is_refund ? styles.refund : styles.credit
                    }`}
                  >
                    {p.is_refund ? "− " : "+ "}
                    {formatCurrency(Math.abs(Number(p.amount)))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <AddServiceModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        patientId={patientId}
        invoiceId={invoice.id}
      />
    </>
  );
}
