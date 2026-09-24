"use client";

import { Table as AntTable } from "antd";
import type { TableProps as AntTableProps } from "antd";
import styles from "./table.module.scss";

export interface TableProps<T> extends AntTableProps<T> {}

export function Table<T extends object>(props: TableProps<T>) {
  return (
    <AntTable<T>
      rowKey="id"
      size="middle"
      className={[styles.table, props.className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
