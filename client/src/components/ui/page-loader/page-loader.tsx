"use client";

import { Spin } from "antd";
import styles from "./page-loader.module.scss";

export interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = "Loading..." }: PageLoaderProps) {
  return (
    <div className={styles.wrapper}>
      <Spin size="large" />
      <div className={styles.label}>{label}</div>
    </div>
  );
}
