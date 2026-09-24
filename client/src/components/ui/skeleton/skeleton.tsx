"use client";

import { Skeleton as AntSkeleton } from "antd";
import styles from "./skeleton.module.scss";

interface SkeletonProps {
  rows?: number;
  active?: boolean;
  className?: string;
}

export function Skeleton({ rows = 3, active = true, className }: SkeletonProps) {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      <AntSkeleton active={active} paragraph={{ rows }} title={false} />
    </div>
  );
}
