"use client";

import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import { Card, EmptyState, StatusBadge, Table } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceListItem } from "@/features/patients/types";
import styles from "./invoices-table.module.scss";

interface InvoicesTableProps {
  data: InvoiceListItem[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onClearFilters: () => void;
}

export function InvoicesTable({
  data,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  onClearFilters,
}: InvoicesTableProps) {
  const columns: ColumnsType<InvoiceListItem> = [
    {
      title: "Invoice #",
      dataIndex: "invoice_number",
      key: "invoice_number",
      width: 170,
      render: (n: string, r) => (
        <Link
          href={`/patients/${r.patient_id}/billing`}
          className={styles.number}
        >
          {n}
        </Link>
      ),
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
      title: "Service",
      dataIndex: "service",
      key: "service",
      ellipsis: true,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (d: string) => (
        <span className={styles.muted}>{formatDate(d, "long")}</span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 130,
      align: "right",
      render: (v: string) => (
        <span className={styles.amount}>{formatCurrency(v)}</span>
      ),
    },
    {
      title: "Paid",
      dataIndex: "paid_amount",
      key: "paid_amount",
      width: 130,
      align: "right",
      render: (v: string) => (
        <span className={styles.paid}>{formatCurrency(v)}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => <StatusBadge status={status} />,
    },
  ];

  if (!loading && data.length === 0 && total === 0) {
    return (
      <Card>
        <EmptyState
          title="No invoices yet"
          description="Invoices will appear here once they are created."
        />
      </Card>
    );
  }

  return (
    <Card padded={false}>
      <Table<InvoiceListItem>
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
              title="No invoices match these filters"
              description="Try adjusting the search or clearing the filters."
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
  );
}
