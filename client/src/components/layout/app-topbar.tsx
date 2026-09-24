"use client";

import { Avatar, Button, Dropdown, Input } from "antd";
import { Bell, HelpCircle, LogOut, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { storage } from "@/services";
import { getInitials } from "@/lib/utils";

export function AppTopbar() {
  const router = useRouter();

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/login");
  };

  return (
    <div className="h-16 flex items-center gap-4 px-6 bg-white border-b border-[var(--brand-border)]">
      <div className="flex-1 max-w-md">
        <Input
          placeholder="Quick patient search..."
          prefix={<Search size={16} className="text-slate-400" />}
          allowClear
        />
      </div>

      <Button type="text" icon={<Bell size={18} />} />
      <Button type="text" icon={<HelpCircle size={18} />} />

      <Dropdown
        trigger={["click"]}
        menu={{
          items: [
            {
              key: "logout",
              icon: <LogOut size={14} />,
              label: "Sign out",
              onClick: handleLogout,
            },
          ],
        }}
      >
        <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-slate-100">
          <Avatar size={32} style={{ backgroundColor: "#14B8A6" }} icon={<User size={14} />} />
          <span className="text-sm font-medium">Front Desk</span>
        </button>
      </Dropdown>
    </div>
  );
}
