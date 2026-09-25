"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "../button";
import { Modal } from "../modal";
import styles from "./confirm-modal.module.scss";

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={null}
      onCancel={onCancel}
      footer={null}
      width={440}
      maskClosable={!loading}
    >
      <div className={styles.body}>
        {tone === "danger" && (
          <div className={styles.iconWrap}>
            <AlertTriangle size={20} />
          </div>
        )}

        <div className={styles.text}>
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="default" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant="primary"
          tone={tone === "danger" ? "danger" : "default"}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
