"use client";

import { App } from "antd";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import {
  AsyncSearchSelect,
  Button,
  DatePicker,
  Input,
  Modal,
  Select,
} from "@/components/ui";
import { useAppForm } from "@/hooks/use-app-form";
import { fetchPatients } from "@/features/patients/api";
import type { Appointment, SlotRead, TherapistDaySchedule } from "../../types";
import {
  appointmentCreateSchema,
  appointmentRescheduleSchema,
  type AppointmentCreateFormData,
  type AppointmentRescheduleFormData,
} from "./schema";
import { useBookAppointment, useUpdateAppointment } from "../../mutations";
import styles from "./appointment-form-modal.module.scss";

type Mode = "book" | "reschedule";

interface AppointmentFormModalProps {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  slot?: { therapist: TherapistDaySchedule; slot: SlotRead; date: string };
  appointment?: Appointment;
  onBooked?: () => void;
}

const METHOD_OPTIONS = [
  { value: "Cash", label: "Cash" },
  { value: "Card", label: "Card" },
  { value: "eSewa", label: "eSewa" },
  { value: "Khalti", label: "Khalti" },
  { value: "Bank Transfer", label: "Bank Transfer" },
];

export function AppointmentFormModal(props: AppointmentFormModalProps) {
  if (props.mode === "book") return <BookForm {...props} />;
  return <RescheduleForm {...props} />;
}

// ---------------- Book ----------------

function BookForm({
  open,
  onClose,
  slot,
  onBooked,
}: AppointmentFormModalProps) {
  const { message } = App.useApp();
  const book = useBookAppointment();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useAppForm<typeof appointmentCreateSchema>(appointmentCreateSchema, {
    patient_id: 0,
    payment_method: "Cash",
    txn_id: "",
    last4: "",
    mobile: "",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      reset({
        patient_id: 0,
        payment_method: "Cash",
        txn_id: "",
        last4: "",
        mobile: "",
        reference: "",
        notes: "",
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: AppointmentCreateFormData) => {
    if (!slot) return;
    try {
      const details: Record<string, string> = {};
      if (data.payment_method === "eSewa" || data.payment_method === "Khalti") {
        if (data.txn_id) details.txn_id = data.txn_id;
        if (data.mobile) details.mobile = data.mobile;
      }
      if (data.payment_method === "Card" && data.last4) {
        details.last4 = data.last4;
      }
      if (data.payment_method === "Bank Transfer" && data.reference) {
        details.reference = data.reference;
      }

      await book.mutateAsync({
        patient_id: data.patient_id,
        therapist_id: slot.therapist.therapist_id,
        date: slot.date,
        start_time: slot.slot.start_time,
        end_time: slot.slot.end_time,
        payment_method: data.payment_method ?? null,
        payment_details: Object.keys(details).length > 0 ? details : null,
        notes: data.notes || null,
      });

      message.success("Appointment booked.");
      onBooked?.();
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not book the appointment.";
      message.error(msg);
    }
  };

  const saving = isSubmitting || book.isPending;

  return (
    <Modal
      open={open}
      title="Book appointment"
      onCancel={onClose}
      width={560}
      heightVh={80}
      maskClosable={false}
      footer={
        <div className={styles.footer}>
          <Button variant="default" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            loading={saving}
          >
            Book
          </Button>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        {slot && (
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Therapist</span>
              <span>{slot.therapist.therapist_name}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Date</span>
              <span>{slot.date}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Time</span>
              <span>
                {slot.slot.start_time.slice(0, 5)} –{" "}
                {slot.slot.end_time.slice(0, 5)}
              </span>
            </div>
          </div>
        )}

        <Controller
          name="patient_id"
          control={control}
          render={({ field }) => (
            <AsyncSearchSelect
              label="Patient"
              required
              placeholder="Search patient by name or phone"
              value={field.value || undefined}
              onChange={(v) => field.onChange(typeof v === "number" ? v : 0)}
              onSearch={async (search) => {
                const res = await fetchPatients({ search, page: 1, page_size: 20 });
                return res.items.map((p) => ({
                  value: p.id,
                  label: p.name,
                  sublabel: p.phone,
                }));
              }}
              error={errors.patient_id?.message}
            />
          )}
        />

        <Controller
          name="payment_method"
          control={control}
          render={({ field }) => (
            <div className={styles.field}>
              <label className={styles.label}>Payment method</label>
              <Select
                options={METHOD_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                allowClear={false}
              />
            </div>
          )}
        />

        <PaymentMethodFields
          control={control}
          method={control._formValues.payment_method}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              label="Notes"
              placeholder="Optional notes about this appointment"
              autoSize={{ minRows: 2, maxRows: 3 }}
            />
          )}
        />
      </form>
    </Modal>
  );
}

// ---------------- Reschedule ----------------

function RescheduleForm({
  open,
  onClose,
  appointment,
}: AppointmentFormModalProps) {
  const { message } = App.useApp();
  const update = useUpdateAppointment();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useAppForm<typeof appointmentRescheduleSchema>(
    appointmentRescheduleSchema,
    { datetime: "" },
  );

  useEffect(() => {
    if (open && appointment) {
      reset({
        datetime: `${appointment.date}T${appointment.start_time.slice(0, 5)}:00`,
      });
    }
  }, [open, appointment, reset]);

  const onSubmit = async (data: AppointmentRescheduleFormData) => {
    if (!appointment) return;
    try {
      const d = new Date(data.datetime);
      const dateStr = d.toISOString().slice(0, 10);
      const startTime = d.toISOString().slice(11, 19);

      const [h, m, s] = startTime.split(":");
      const startDate = new Date(`2000-01-01T${h}:${m}:${s}Z`);
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
      const endTime = endDate.toISOString().slice(11, 19);

      await update.mutateAsync({
        id: appointment.id,
        payload: { date: dateStr, start_time: startTime, end_time: endTime },
      });

      message.success("Appointment rescheduled.");
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not reschedule.";
      message.error(msg);
    }
  };

  const saving = isSubmitting || update.isPending;

  return (
    <Modal
      open={open}
      title="Reschedule appointment"
      onCancel={onClose}
      width={480}
      heightVh={60}
      maskClosable={false}
      footer={
        <div className={styles.footer}>
          <Button variant="default" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            loading={saving}
          >
            Reschedule
          </Button>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="datetime"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="New date & time"
              required
              showTime
              value={field.value ? new Date(field.value).toISOString() : null}
              onChange={(iso) => field.onChange(iso ? iso.slice(0, 19) : "")}
              error={errors.datetime?.message}
            />
          )}
        />
      </form>
    </Modal>
  );
}

// ---------------- Shared ----------------

import type { Control, FieldValues, Path } from "react-hook-form";

interface PaymentFieldsProps<T extends FieldValues> {
  control: Control<T>;
  method: string | undefined;
}

function PaymentMethodFields<T extends FieldValues>({
  control,
  method,
}: PaymentFieldsProps<T>) {
  if (method === "eSewa" || method === "Khalti") {
    return (
      <div className={styles.row}>
        <Controller
          name={"txn_id" as Path<T>}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={(field.value as string | undefined) ?? ""}
              label="Transaction ID"
              placeholder="TXN-…"
            />
          )}
        />
        <Controller
          name={"mobile" as Path<T>}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={(field.value as string | undefined) ?? ""}
              label="Mobile number"
              placeholder="98xxxxxxxx"
            />
          )}
        />
      </div>
    );
  }
  if (method === "Card") {
    return (
      <Controller
        name={"last4" as Path<T>}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={(field.value as string | undefined) ?? ""}
            label="Card last 4 digits"
            placeholder="1234"
            maxLength={4}
          />
        )}
      />
    );
  }
  if (method === "Bank Transfer") {
    return (
      <Controller
        name={"reference" as Path<T>}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={(field.value as string | undefined) ?? ""}
            label="Bank reference"
            placeholder="Reference number"
          />
        )}
      />
    );
  }
  return null;
}
