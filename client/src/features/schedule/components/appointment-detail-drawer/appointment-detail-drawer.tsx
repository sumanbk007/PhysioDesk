"use client";

import { App } from "antd";
import { useState } from "react";
import {
  Button,
  ConfirmModal,
  Drawer,
  InfoList,
  SectionHeader,
  StatusBadge,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { fetchAppointment } from "../../api";
import { useCancelAppointment } from "../../mutations";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/http/query-keys";
import { useAuthStore } from "@/features/auth/store";
import type { Appointment } from "../../types";
import { AppointmentFormModal } from "../appointment-form-modal";
import styles from "./appointment-detail-drawer.module.scss";

interface AppointmentDetailDrawerProps {
  appointmentId: number | null;
  onClose: () => void;
}

export function AppointmentDetailDrawer({
  appointmentId,
  onClose,
}: AppointmentDetailDrawerProps) {
  const { message } = App.useApp();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const cancel = useCancelAppointment();

  const appointment = useQuery({
    queryKey: queryKeys.appointments.detail(appointmentId ?? 0),
    queryFn: () => fetchAppointment(appointmentId as number),
    enabled: hydrated && !!token && !!appointmentId,
  });

  const handleCancel = async () => {
    if (!appointmentId) return;
    try {
      await cancel.mutateAsync(appointmentId);
      message.success("Appointment cancelled.");
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not cancel.";
      message.error(msg);
    }
  };

  const open = appointmentId !== null;

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title="Appointment"
        width={480}
      >
        {!appointment.data ? (
          <div className={styles.loading}>Loading…</div>
        ) : (
          <div className={styles.body}>
            <SectionHeader
              title={appointment.data.date}
              subtitle={appointment.data.status}
              action={<StatusBadge status={appointment.data.status} />}
            />

            <InfoList
              items={[
                {
                  label: "Patient",
                  value: `#${appointment.data.patient_id}`,
                },
                {
                  label: "Therapist",
                  value: `#${appointment.data.therapist_id}`,
                },
                {
                  label: "Time",
                  value: `${appointment.data.start_time.slice(0, 5)} – ${appointment.data.end_time.slice(0, 5)}`,
                },
                {
                  label: "Date",
                  value: formatDate(appointment.data.date, "long"),
                },
                {
                  label: "Payment method",
                  value: appointment.data.payment_method ?? "—",
                },
                {
                  label: "Notes",
                  value: appointment.data.notes ?? "—",
                },
              ]}
            />

            <div className={styles.actions}>
              <Button
                variant="default"
                tone="danger"
                onClick={() => setConfirmOpen(true)}
                disabled={appointment.data.status === "Cancelled"}
              >
                Cancel appointment
              </Button>
              <Button
                variant="primary"
                onClick={() => setRescheduleOpen(true)}
                disabled={appointment.data.status === "Cancelled"}
              >
                Reschedule
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmModal
        open={confirmOpen}
        title="Cancel this appointment?"
        description="The slot will become available again. This action can't be undone."
        confirmText="Cancel appointment"
        cancelText="Keep"
        tone="danger"
        loading={cancel.isPending}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />

      {appointment.data && (
        <AppointmentFormModal
          open={rescheduleOpen}
          onClose={() => {
            setRescheduleOpen(false);
            onClose();
          }}
          mode="reschedule"
          appointment={appointment.data as Appointment}
        />
      )}
    </>
  );
}
