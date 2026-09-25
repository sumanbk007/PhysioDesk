"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { Card, EmptyState, PageLoader, SectionHeader } from "@/components/ui";
import { usePatientInvoices } from "../../queries";
import type { InvoiceListItem } from "../../types";
import { InvoicesTable } from "./invoices-table";
import { PaymentHistoryPanel } from "./payment-history-panel";
import { RecordPaymentModal } from "./record-payment-modal";
import styles from "./patient-billing.module.scss";

interface PatientBillingProps {
  patientId: number;
}

export function PatientBilling({ patientId }: PatientBillingProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceListItem | null>(
    null,
  );

  const invoices = usePatientInvoices(patientId, { page, page_size: pageSize });

  const handleToggleExpand = (id: number) => {
    setExpandedRowKeys((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
    );
  };

  const handlePageChange = (p: number, ps: number) => {
    setPage(p);
    setPageSize(ps);
    setExpandedRowKeys([]);
  };

  const handleOpenPayment = (invoiceId: number) => {
    const invoice = invoices.data?.items.find((i) => i.id === invoiceId);
    if (invoice) setPaymentInvoice(invoice);
  };

  if (invoices.isLoading && !invoices.data) {
    return <PageLoader label="Loading invoices..." />;
  }

  const items = invoices.data?.items ?? [];
  const total = invoices.data?.total ?? 0;

  if (!invoices.isLoading && items.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Receipt size={32} />}
          title="No invoices yet"
          description="Invoices for this patient will appear here."
        />
      </Card>
    );
  }

  return (
    <>
      <Card padded={false} className={styles.card}>
        <div className={styles.header}>
          <SectionHeader
            title="Invoices"
            subtitle={`${total} ${total === 1 ? "invoice" : "invoices"}`}
          />
        </div>

        <InvoicesTable
          data={items}
          total={total}
          loading={invoices.isLoading}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          expandedRowKeys={expandedRowKeys}
          onToggleExpand={handleToggleExpand}
          renderExpandedRow={(invoice) => (
            <PaymentHistoryPanel
              invoiceId={invoice.id}
              onRecordPayment={handleOpenPayment}
            />
          )}
        />
      </Card>

      <RecordPaymentModal
        open={paymentInvoice !== null}
        onClose={() => setPaymentInvoice(null)}
        patientId={patientId}
        invoice={paymentInvoice}
      />
    </>
  );
}
