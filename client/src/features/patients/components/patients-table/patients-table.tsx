"use client";

import { useRouter } from "next/navigation";
import { Card, EmptyState, Table } from "@/components/ui";
import type { PatientListItem } from "../../types";
import { makeColumns } from "../../columns";
import styles from "./patients-table.module.scss";

interface PatientsTableProps {
  data: PatientListItem[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onClearFilters: () => void;
}

export function PatientsTable({
  data,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  onClearFilters,
}: PatientsTableProps) {
  const router = useRouter();
  const columns = makeColumns();

  if (!loading && data.length === 0 && total === 0) {
    return (
      <Card>
        <EmptyState
          title="No patients yet"
          description="Add your first patient to get started."
        />
      </Card>
    );
  }

  return (
    <Card padded={false}>
      <Table<PatientListItem>
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (total, range) =>
            `Showing ${range[0]}–${range[1]} of ${total}`,
          onChange: onPageChange,
        }}
        onRow={(record) => ({
          onClick: () => router.push(`/patients/${record.id}`),
        })}
        locale={{
          emptyText: (
            <EmptyState
              title="No patients match these filters"
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
        className={styles.table}
      />
    </Card>
  );
}
