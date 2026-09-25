"use client";

import { usePathname } from "next/navigation";
import { PageTabs } from "@/components/ui";
import type { PageTabItem } from "@/components/ui";

interface PatientTabsProps {
  patientId: number;
  sessionCount?: number;
  noteCount?: number;
  invoiceCount?: number;
}

export function PatientTabs({
  patientId,
  sessionCount,
  noteCount,
  invoiceCount,
}: PatientTabsProps) {
  const pathname = usePathname();

  const base = `/patients/${patientId}`;

  const items: PageTabItem[] = [
    { key: "overview", label: "Overview", href: base },
    { key: "reports", label: "Reports", href: `${base}/reports` },
    {
      key: "sessions",
      label: "Sessions",
      href: `${base}/sessions`,
      badge: sessionCount,
    },
    {
      key: "notes",
      label: "Notes",
      href: `${base}/notes`,
      badge: noteCount,
    },
    { key: "progress", label: "Progress", href: `${base}/progress` },
    {
      key: "billing",
      label: "Billing",
      href: `${base}/billing`,
      badge: invoiceCount,
    },
  ];

  const activeKey =
    items.find((i) => i.href === pathname)?.key ??
    items.find((i) => i.href !== base && pathname.startsWith(i.href))?.key ??
    "overview";

  return <PageTabs items={items} activeKey={activeKey} />;
}
