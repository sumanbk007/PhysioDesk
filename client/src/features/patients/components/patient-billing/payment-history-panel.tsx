"use client";

import { Plus } from "lucide-react";
import { Button, EmptyState, PageLoader } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useInvoicePayments } from "../../queries";
import styles from "./payment-history-panel.module.scss";

interface PaymentHistoryPanelProps {
  invoiceId: number;
  onRecordPayment: (invoiceId: number) => void;
}

export function PaymentHistoryPanel({
  invoiceId,
  onRecordPayment,
}: PaymentHistoryPanelProps) {
  const payments = useInvoicePayments(invoiceId);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Payment history</span>
        <Button
          variant="default"
          size="small"
          icon={<Plus size={13} />}
          onClick={(e) => {
            e.stopPropagation();
            onRecordPayment(invoiceId);
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
        <ul className={styles.list}>
          {payments.data.map((p) => (
            <li key={p.id} className={styles.item}>
              <div className={styles.itemLeft}>
                <span className={styles.method}>{p.method}</span>
                <span className={styles.date}>
                  {formatDate(p.created_at, "datetime")}
                </span>
                {p.note && <span className={styles.note}>{p.note}</span>}
              </div>
              <div
                className={`${styles.amount} ${
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
  );
}
