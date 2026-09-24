"use client";

import { Avatar, Dropdown } from "antd";
import { Bell, ChevronDown, HelpCircle, LogOut, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store";
import { getInitials } from "@/lib/utils";
import styles from "./app-topbar.module.scss";

export function AppTopbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const displayName = user?.full_name ?? user?.username ?? "Front Desk";
  const initials = user ? getInitials(displayName) : "FD";

  return (
    <header className={styles.topbar}>
      <div className={styles.search}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="search"
          placeholder="Search patients, invoices..."
          className={styles.searchInput}
          aria-label="Search"
        />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.iconButton} aria-label="Notifications">
          <Bell size={18} />
          <span className={styles.dot} />
        </button>

        <button type="button" className={styles.iconButton} aria-label="Help">
          <HelpCircle size={18} />
        </button>

        <div className={styles.divider} />

        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          menu={{
            items: [
              {
                key: "user-header",
                type: "group",
                label: (
                  <div className={styles.menuHeader}>
                    <div className={styles.menuName}>{displayName}</div>
                    <div className={styles.menuRole}>{user?.role ?? "front_desk"}</div>
                  </div>
                ),
              },
              { type: "divider" },
              {
                key: "logout",
                icon: <LogOut size={14} />,
                label: "Sign out",
                onClick: handleLogout,
                danger: true,
              },
            ],
          }}
        >
          <button type="button" className={styles.userButton}>
            <Avatar
              size={32}
              style={{ backgroundColor: "#14B8A6", fontSize: 12, fontWeight: 600 }}
              icon={!user && <User size={14} />}
            >
              {user ? initials : null}
            </Avatar>
            <span className={styles.userName}>{displayName}</span>
            <ChevronDown size={14} className={styles.chevron} />
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
