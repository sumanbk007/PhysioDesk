"use client";

import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import type { ReactNode } from "react";

export interface ActionsMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick?: () => void;
}

interface ActionsMenuProps {
  items: (ActionsMenuItem | { type: "divider"; key: string })[];
  trigger: ReactNode;
  placement?: "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
}

export function ActionsMenu({
  items,
  trigger,
  placement = "bottomRight",
}: ActionsMenuProps) {
  const menuItems: MenuProps["items"] = items.map((item) => {
    if ("type" in item && item.type === "divider") {
      return { type: "divider", key: item.key };
    }
    const i = item as ActionsMenuItem;
    return {
      key: i.key,
      label: i.label,
      icon: i.icon,
      danger: i.danger,
      onClick: i.onClick,
    };
  });

  return (
    <Dropdown
      trigger={["click"]}
      placement={placement}
      menu={{ items: menuItems }}
    >
      {trigger}
    </Dropdown>
  );
}
