"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Table, StatusBadge } from "@/components/ui";
import type { ColumnsType } from "antd/es/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceListItem } from "../../types";
import styles from "./invoices-table.module.scss";

interface InvoicesTableProps {
  data: InvoiceListItem[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  expandedRowKeys: number[];
  onToggleExpand: (id: number) => void;
  renderExpandedRow: (invoice: InvoiceListItem) => React.ReactNode;
}

export function InvoicesTable({
  data,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  expandedRowKeys,
  onToggleExpand,
  renderExpandedRow,
}: InvoicesTableProps) {
  const columns: ColumnsType<InvoiceListItem> = [
    {
      title: "",
      key: "expand",
      width: 44,
      render: (_, r) => {
        const expanded = expandedRowKeys.includes(r.id);
        return (
          <button
            type="button"
            className={styles.expandBtn}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(r.id);
            }}
            aria-label={expanded ? "Collapse payments" : "Expand payments"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        );
      },
    },
    {
      title: "Invoice #",
      dataIndex: "invoice_number",
      key: "invoice_number",
      width: 160,
      render: (n: string) => <span className={styles.number}>{n}</span>,
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
      title: "Total",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (v: string, r) => (
        <div className={styles.amounts}>
          <span className={styles.amount}>{formatCurrency(v)}</span>
          {Number(r.discount) > 0 && (
            <span className={styles.discount}>
              − {formatCurrency(r.discount)} discount
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Paid",
      dataIndex: "paid_amount",
      key: "paid_amount",
      width: 120,
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

  return (
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
      expandable={{
        expandedRowKeys,
        expandedRowRender: renderExpandedRow,
        showExpandColumn: false,
      }}
      onRow={(record) => ({
        onClick: () => onToggleExpand(record.id),
      })}
    />
  );
}
