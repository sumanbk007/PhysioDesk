"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Button,
  ConfirmModal,
  Skeleton,
  StatusBadge,
} from "@/components/ui";
import { useDeletePatient } from "../../mutations";
import type { Patient } from "../../types";
import styles from "./patient-header.module.scss";

interface PatientHeaderProps {
  patient?: Patient;
  loading: boolean;
  notFound?: boolean;
}

export function PatientHeader({ patient, loading, notFound }: PatientHeaderProps) {
  const router = useRouter();
  const { message } = App.useApp();
  const deletePatient = useDeletePatient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (!patient) return;
    try {
      await deletePatient.mutateAsync(patient.id);
      message.success(`${patient.name} deleted.`);
      router.replace("/patients");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete patient.";
      message.error(msg);
      setConfirmOpen(false);
    }
  };

  if (notFound) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundTitle}>Patient not found</div>
        <div className={styles.notFoundText}>
          This patient may have been deleted or the link is invalid.
        </div>
        <Link href="/patients" className={styles.notFoundLink}>
          ← Back to patients
        </Link>
      </div>
    );
  }

  const meta = patient
    ? [patient.age, patient.gender, patient.phone, patient.address]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <>
      <div className={styles.wrapper}>
        <Link href="/patients" className={styles.back}>
          <ArrowLeft size={14} />
          <span>Back to patients</span>
        </Link>

        <div className={styles.row}>
          {loading || !patient ? (
            <div className={styles.skeleton}>
              <Skeleton rows={2} />
            </div>
          ) : (
            <>
              <div className={styles.identity}>
                <div className={styles.nameRow}>
                  <h1 className={styles.name}>{patient.name}</h1>
                  <StatusBadge status={patient.status} />
                </div>
                <div className={styles.meta}>{meta}</div>
              </div>

              <div className={styles.actions}>
                <Button
                  variant="default"
                  icon={<Pencil size={14} />}
                  disabled
                  title="Edit drawer coming soon"
                >
                  Edit
                </Button>

                <Button
                  variant="default"
                  tone="danger"
                  icon={<Trash2 size={14} />}
                  onClick={() => setConfirmOpen(true)}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={`Delete ${patient?.name ?? "patient"}?`}
        description="This will also remove their clinical notes, reports, and notifications. This action cannot be undone."
        confirmText="Delete patient"
        cancelText="Cancel"
        tone="danger"
        loading={deletePatient.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
