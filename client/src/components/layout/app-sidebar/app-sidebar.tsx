"use client";

import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Receipt,
  Bell,
  Stethoscope,
} from "lucide-react";
import styles from "./app-sidebar.module.scss";
import { NavItem } from "../nav-item";

interface NavConfig {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV: NavConfig[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/billing", label: "Billing", icon: Receipt },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/therapists", label: "Therapists", icon: Stethoscope },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <span>P</span>
        </div>
        <div className={styles.brandText}>
          <div className={styles.brandName}>PhysioDesk</div>
          <div className={styles.brandSub}>Sahayatri Physio</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active}
            />
          );
        })}
      </nav>

      <div className={styles.footer}>
        <span>v0.1.0</span>
      </div>
    </aside>
  );
}
