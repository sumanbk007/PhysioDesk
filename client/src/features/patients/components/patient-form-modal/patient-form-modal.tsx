"use client";

import { App } from "antd";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { Button, Input, Modal, Select } from "@/components/ui";
import { useAppForm } from "@/hooks/use-app-form";
import { useTherapists } from "@/features/therapists/queries";
import { patientSchema, type PatientFormData } from "../../schemas";
import { useCreatePatient, useUpdatePatient } from "../../mutations";
import type { Patient } from "../../types";
import styles from "./patient-form-modal.module.scss";

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
}

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Completed", label: "Completed" },
  { value: "Due for follow-up", label: "Due for follow-up" },
];

export function PatientFormModal({
  open,
  onClose,
  patient,
}: PatientFormModalProps) {
  const { message } = App.useApp();
  const isEdit = Boolean(patient?.id);

  const therapists = useTherapists({ page: 1, page_size: 100 });
  const therapistOptions = (therapists.data?.items ?? []).map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useAppForm<typeof patientSchema>(patientSchema, {
    name: "",
    age: 0,
    gender: "Male",
    phone: "",
    address: "",
    condition: "",
    therapist_id: 0,
    package: "",
    sessions_total: 0,
    sessions_used: 0,
    status: "Active",
    notes: "",
  });

  useEffect(() => {
    if (open && patient) {
      reset({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address ?? "",
        condition: patient.condition,
        therapist_id: patient.therapist_id,
        package: patient.package ?? "",
        sessions_total: patient.sessions_total,
        sessions_used: patient.sessions_used,
        status: patient.status,
        notes: patient.notes ?? "",
      });
    } else if (open && !patient) {
      reset({
        name: "",
        age: 0,
        gender: "Male",
        phone: "",
        address: "",
        condition: "",
        therapist_id: 0,
        package: "",
        sessions_total: 0,
        sessions_used: 0,
        status: "Active",
        notes: "",
      });
    }
  }, [open, patient, reset]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      const payload = {
        ...data,
        address: data.address || null,
        package: data.package || null,
        notes: data.notes || null,
      };

      if (isEdit && patient) {
        await updatePatient.mutateAsync({ id: patient.id, payload });
        message.success(`${data.name} updated.`);
      } else {
        await createPatient.mutateAsync(payload);
        message.success(`${data.name} created.`);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      message.error(msg);
    }
  };

  const saving = isSubmitting || createPatient.isPending || updatePatient.isPending;

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit patient" : "New patient"}
      onCancel={onClose}
      width={640}
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
            {isEdit ? "Save changes" : "Create patient"}
          </Button>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.grid}>
          <div className={styles.full}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Full name"
                  placeholder="e.g. Sunita Tamang"
                  required
                  error={errors.name?.message}
                />
              )}
            />
          </div>

          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <Input
                label="Age"
                type="number"
                placeholder="42"
                required
                value={field.value || ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                onBlur={field.onBlur}
                error={errors.age?.message}
              />
            )}
          />

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <div className={styles.field}>
                <label className={styles.label}>
                  Gender<span className={styles.required}>*</span>
                </label>
                <Select
                  options={GENDER_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  allowClear={false}
                />
                {errors.gender && (
                  <div className={styles.error}>{errors.gender.message}</div>
                )}
              </div>
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Phone"
                placeholder="9841-XXXXXX"
                required
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className={styles.field}>
                <label className={styles.label}>
                  Status<span className={styles.required}>*</span>
                </label>
                <Select
                  options={STATUS_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  allowClear={false}
                />
                {errors.status && (
                  <div className={styles.error}>{errors.status.message}</div>
                )}
              </div>
            )}
          />

          <div className={styles.full}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Address"
                  placeholder="e.g. Baneshwor, Kathmandu"
                  error={errors.address?.message}
                />
              )}
            />
          </div>

          <div className={styles.full}>
            <Controller
              name="condition"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Condition"
                  placeholder="e.g. Lower back pain (L4-L5 disc bulge)"
                  required
                  error={errors.condition?.message}
                />
              )}
            />
          </div>

          <Controller
            name="therapist_id"
            control={control}
            render={({ field }) => (
              <div className={styles.field}>
                <label className={styles.label}>
                  Assigned therapist<span className={styles.required}>*</span>
                </label>
                <Select
                  options={therapistOptions}
                  value={field.value || undefined}
                  onChange={(v) => field.onChange(v)}
                  allowClear={false}
                  placeholder="Select a therapist"
                />
                {errors.therapist_id && (
                  <div className={styles.error}>
                    {errors.therapist_id.message}
                  </div>
                )}
              </div>
            )}
          />

          <Controller
            name="package"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Package"
                placeholder="e.g. 10 sessions - Orthopedic Rehab"
                error={errors.package?.message}
              />
            )}
          />

          <Controller
            name="sessions_total"
            control={control}
            render={({ field }) => (
              <Input
                label="Sessions total"
                type="number"
                required
                value={field.value === 0 ? "" : field.value}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                onBlur={field.onBlur}
                error={errors.sessions_total?.message}
              />
            )}
          />

          <Controller
            name="sessions_used"
            control={control}
            render={({ field }) => (
              <Input
                label="Sessions used"
                type="number"
                value={field.value === 0 ? "" : field.value}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                onBlur={field.onBlur}
                error={errors.sessions_used?.message}
              />
            )}
          />

          <div className={styles.full}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  label="Notes"
                  placeholder="Any additional information"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  error={errors.notes?.message}
                />
              )}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
