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
import { useDeleteTherapist } from "../../mutations";
import { TherapistFormModal } from "../therapist-form-modal";
import type { Therapist } from "../../types";
import styles from "./therapist-header.module.scss";

interface TherapistHeaderProps {
  therapist?: Therapist;
  loading: boolean;
  notFound?: boolean;
}

export function TherapistHeader({
  therapist,
  loading,
  notFound,
}: TherapistHeaderProps) {
  const router = useRouter();
  const { message } = App.useApp();
  const deleteTherapist = useDeleteTherapist();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!therapist) return;
    try {
      await deleteTherapist.mutateAsync(therapist.id);
      message.success(`${therapist.name} deleted.`);
      router.replace("/therapists");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Cannot delete — patients are still assigned to this therapist.";
      message.error(msg);
      setConfirmOpen(false);
    }
  };

  if (notFound) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundTitle}>Therapist not found</div>
        <div className={styles.notFoundText}>
          This therapist may have been deleted or the link is invalid.
        </div>
        <Link href="/therapists" className={styles.notFoundLink}>
          ← Back to therapists
        </Link>
      </div>
    );
  }

  const meta = therapist
    ? [therapist.specialty, therapist.phone, therapist.email]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <>
      <div className={styles.wrapper}>
        <Link href="/therapists" className={styles.back}>
          <ArrowLeft size={14} />
          <span>Back to therapists</span>
        </Link>

        <div className={styles.row}>
          {loading || !therapist ? (
            <div className={styles.skeleton}>
              <Skeleton rows={2} />
            </div>
          ) : (
            <>
              <div className={styles.identity}>
                <div className={styles.nameRow}>
                  <h1 className={styles.name}>{therapist.name}</h1>
                  <StatusBadge
                    status={therapist.is_active ? "Active" : "Cancelled"}
                  />
                </div>
                <div className={styles.meta}>{meta}</div>
              </div>

              <div className={styles.actions}>
                <Button
                  variant="default"
                  icon={<Pencil size={14} />}
                  onClick={() => setEditOpen(true)}
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
        title={`Delete ${therapist?.name ?? "therapist"}?`}
        description="The therapist can only be deleted if no patients are still assigned to them. This action cannot be undone."
        confirmText="Delete therapist"
        cancelText="Cancel"
        tone="danger"
        loading={deleteTherapist.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <TherapistFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        therapist={therapist}
      />
    </>
  );
}
