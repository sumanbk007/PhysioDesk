"use client";

import { useRouter } from "next/navigation";
import { Card, EmptyState, Table } from "@/components/ui";
import { makeTherapistColumns } from "../../columns";
import type { TherapistListItem } from "../../types";
import styles from "./therapists-table.module.scss";

interface TherapistsTableProps {
  data: TherapistListItem[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onClearFilters: () => void;
}

export function TherapistsTable({
  data,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  onClearFilters,
}: TherapistsTableProps) {
  const router = useRouter();
  const columns = makeTherapistColumns();

  if (!loading && data.length === 0 && total === 0) {
    return (
      <Card>
        <EmptyState
          title="No therapists yet"
          description="Add your first therapist to get started."
        />
      </Card>
    );
  }

  return (
    <Card padded={false}>
      <Table<TherapistListItem>
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
          onClick: () => router.push(`/therapists/${record.id}`),
        })}
        locale={{
          emptyText: (
            <EmptyState
              title="No therapists match these filters"
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
