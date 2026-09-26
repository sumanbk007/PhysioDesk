"use client";

import { FileImage, FileText, Download, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { App } from "antd";
import { Button, ConfirmModal } from "@/components/ui";
import { api } from "@/services/http/client";
import { formatDate } from "@/lib/utils";
import { useDeleteReport } from "../../mutations";
import type { ReportFile } from "../../types";
import styles from "./report-card.module.scss";

interface ReportCardProps {
  patientId: number;
  report: ReportFile;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function IconForMime({ mime }: { mime: string }) {
  if (mime.startsWith("image/")) return <FileImage size={20} />;
  return <FileText size={20} />;
}

export function ReportCard({ patientId, report }: ReportCardProps) {
  const { message } = App.useApp();
  const del = useDeleteReport(patientId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await api.download(
        `/patients/${patientId}/reports/${report.id}/download`,
        report.filename,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Download failed.";
      message.error(msg);
    } finally {
      setDownloading(false);
    }
  };

  const handleView = async () => {
    try {
      await api.view(`/patients/${patientId}/reports/${report.id}/download`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not open file.";
      message.error(msg);
    }
  };

  const handleDelete = async () => {
    try {
      await del.mutateAsync(report.id);
      message.success("Report deleted.");
      setConfirmOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed.";
      message.error(msg);
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.icon}>
          <IconForMime mime={report.mime_type} />
        </div>

        <div className={styles.body}>
          <div className={styles.filename} title={report.filename}>
            {report.filename}
          </div>
          {report.description && (
            <div className={styles.description}>{report.description}</div>
          )}
          <div className={styles.meta}>
            {formatBytes(report.size_bytes)} ·{" "}
            {formatDate(report.uploaded_at, "long")}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.action}
            onClick={handleView}
            title="View"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className={styles.action}
            onClick={handleDownload}
            disabled={downloading}
            title="Download"
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            className={`${styles.action} ${styles.danger}`}
            onClick={() => setConfirmOpen(true)}
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={`Delete "${report.filename}"?`}
        description="This permanently removes the file. This action can't be undone."
        confirmText="Delete file"
        cancelText="Cancel"
        tone="danger"
        loading={del.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
