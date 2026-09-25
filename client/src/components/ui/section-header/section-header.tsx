"use client";

import { ReactNode } from "react";
import styles from "./section-header.module.scss";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  size?: "default" | "large";
  divider?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  size = "default",
  divider = false,
}: SectionHeaderProps) {
  return (
    <div
      className={[
        styles.wrapper,
        size === "large" ? styles.large : styles.default,
        divider ? styles.withDivider : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
