"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu } from "antd";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Receipt,
  Bell,
  Stethoscope,
} from "lucide-react";

const { Sider } = Layout;

const NAV = [
  { key: "/", label: "Dashboard", icon: LayoutDashboard },
  { key: "/patients", label: "Patients", icon: Users },
  { key: "/schedule", label: "Schedule", icon: CalendarDays },
  { key: "/billing", label: "Billing", icon: Receipt },
  { key: "/notifications", label: "Notifications", icon: Bell },
  { key: "/therapists", label: "Therapists", icon: Stethoscope },
];

export function AppSidebar() {
  const pathname = usePathname();

  const selected =
    NAV.find((item) =>
      item.key === "/" ? pathname === "/" : pathname.startsWith(item.key)
    )?.key ?? "/";

  return (
    <Sider
      width={240}
      theme="light"
      style={{
        borderRight: "1px solid var(--brand-border)",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <div className="h-16 flex items-center gap-3 px-5 border-b border-[var(--brand-border)]">
        <div className="w-9 h-9 rounded-lg bg-[#14B8A6] text-white flex items-center justify-center font-bold">
          P
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">PhysioDesk</div>
          <div className="text-[11px] text-slate-500">Sahayatri Physio</div>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selected]}
        style={{ borderInlineEnd: "none", paddingTop: 8 }}
        items={NAV.map((item) => ({
          key: item.key,
          icon: <item.icon size={16} />,
          label: <Link href={item.key}>{item.label}</Link>,
        }))}
      />
    </Sider>
  );
}
