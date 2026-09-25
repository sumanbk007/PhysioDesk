"use client";

import { Drawer as AntDrawer } from "antd";
import type { DrawerProps as AntDrawerProps } from "antd";
import styles from "./drawer.module.scss";

export interface DrawerProps extends AntDrawerProps {}

export function Drawer({ width = 480, className, ...rest }: DrawerProps) {
  return (
    <AntDrawer
      width={width}
      className={[styles.drawer, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
