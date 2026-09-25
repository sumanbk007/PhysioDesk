"use client";

import { Modal as AntModal } from "antd";
import type { ModalProps as AntModalProps } from "antd";
import styles from "./modal.module.scss";

export interface ModalProps extends AntModalProps {
  footer?: AntModalProps["footer"];
}

export function Modal({
  width = 560,
  centered = true,
  destroyOnHidden = true,
  maskClosable = false,
  footer,
  className,
  ...rest
}: ModalProps) {
  return (
    <AntModal
      width={width}
      centered={centered}
      destroyOnHidden={destroyOnHidden}
      maskClosable={maskClosable}
      footer={footer}
      className={[styles.modal, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
