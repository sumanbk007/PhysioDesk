"use client";

import { App, Upload } from "antd";
import { useState } from "react";
import { FileText, UploadCloud } from "lucide-react";
import { Button, Input, Modal } from "@/components/ui";
import { useUploadReport } from "../../mutations";
import styles from "./report-upload-modal.module.scss";

interface ReportUploadModalProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
}

const MAX_MB = 10;
const ALLOWED = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

export function ReportUploadModal({
  open,
  onClose,
  patientId,
}: ReportUploadModalProps) {
  const { message } = App.useApp();
  const upload = useUploadReport(patientId);

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  const reset = () => {
    setFile(null);
    setDescription("");
  };

  const handleClose = () => {
    if (!upload.isPending) {
      reset();
      onClose();
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await upload.mutateAsync({ file, description: description || undefined });
      message.success(`${file.name} uploaded.`);
      reset();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      message.error(msg);
    }
  };

  return (
    <Modal
      open={open}
      title="Upload report"
      onCancel={handleClose}
      width={520}
      heightVh={70}
      maskClosable={false}
      footer={
        <div className={styles.footer}>
          <Button variant="default" onClick={handleClose} disabled={upload.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            loading={upload.isPending}
            disabled={!file}
          >
            Upload
          </Button>
        </div>
      }
    >
      <div className={styles.body}>
        <Upload.Dragger
          name="file"
          multiple={false}
          maxCount={1}
          accept={ALLOWED.join(",")}
          beforeUpload={(f) => {
            if (f.size > MAX_MB * 1024 * 1024) {
              message.error(`File exceeds ${MAX_MB} MB limit.`);
              return Upload.LIST_IGNORE;
            }
            setFile(f);
            return false;
          }}
          onRemove={() => {
            setFile(null);
          }}
          fileList={
            file
              ? [
                  {
                    uid: "-1",
                    name: file.name,
                    status: "done" as const,
                    size: file.size,
                  },
                ]
              : []
          }
          className={styles.dragger}
        >
          <div className={styles.dropContent}>
            <UploadCloud size={32} className={styles.dropIcon} />
            <div className={styles.dropTitle}>
              Click or drag a file to upload
            </div>
            <div className={styles.dropHint}>
              PDF, JPG, PNG, or WEBP · up to {MAX_MB} MB
            </div>
          </div>
        </Upload.Dragger>

        <Input
          label="Description"
          placeholder="e.g. Right shoulder X-ray, MRI report"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={255}
        />

        {file && (
          <div className={styles.selectedFile}>
            <FileText size={14} />
            <span>{file.name}</span>
            <span className={styles.selectedSize}>
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
