"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import styles from "./nav-item.module.scss";

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}

export function NavItem({ href, label, icon: Icon, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`${styles.item} ${active ? styles.active : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} className={styles.icon} />
      <span className={styles.label}>{label}</span>
    </Link>
  );
}
