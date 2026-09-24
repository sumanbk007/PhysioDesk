"use client";

import { Popconfirm as AntPopconfirm } from "antd";
import type { PopconfirmProps as AntPopconfirmProps } from "antd";
import styles from "./popconfirm.module.scss";

export interface PopconfirmProps extends AntPopconfirmProps {}

export function Popconfirm({
  okText = "Confirm",
  cancelText = "Cancel",
  okButtonProps,
  className,
  ...rest
}: PopconfirmProps) {
  return (
    <AntPopconfirm
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ danger: true, ...okButtonProps }}
      className={[styles.popconfirm, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
