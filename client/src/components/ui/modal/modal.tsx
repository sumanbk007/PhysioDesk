"use client";

import { Modal as AntModal } from "antd";
import type { ModalProps as AntModalProps } from "antd";
import css from "./modal.module.scss";

export interface ModalProps extends AntModalProps {
  /** Height of the modal as a viewport percentage. Default 80. */
  heightVh?: number;
}

export function Modal({
  width = 560,
  centered = true,
  destroyOnHidden = true,
  maskClosable = false,
  footer,
  className,
  heightVh = 80,
  ...rest
}: ModalProps) {
  return (
    <AntModal
      width={width}
      centered={centered}
      destroyOnHidden={destroyOnHidden}
      maskClosable={maskClosable}
      footer={footer}
      className={[css.modal, className].filter(Boolean).join(" ")}
      style={
        {
          "--pd-modal-height": `${heightVh}vh`,
        } as React.CSSProperties
      }
      {...rest}
    />
  );
}
