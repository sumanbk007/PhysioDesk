"use client";

import Link from "next/link";
import styles from "./page-tabs.module.scss";

export interface PageTabItem {
  key: string;
  label: string;
  href: string;
  badge?: string | number;
}

interface PageTabsProps {
  items: PageTabItem[];
  activeKey: string;
}

export function PageTabs({ items, activeKey }: PageTabsProps) {
  return (
    <nav className={styles.tabs} role="tablist">
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Link
            key={item.key}
            href={item.href}
            role="tab"
            aria-selected={active}
            className={`${styles.tab} ${active ? styles.active : ""}`}
          >
            <span className={styles.label}>{item.label}</span>
            {item.badge !== undefined && item.badge !== null && (
              <span className={styles.badge}>{item.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
