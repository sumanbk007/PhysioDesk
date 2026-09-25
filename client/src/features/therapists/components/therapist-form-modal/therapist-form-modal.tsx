"use client";

import { App } from "antd";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { Button, Input, Modal, Select } from "@/components/ui";
import { useAppForm } from "@/hooks/use-app-form";
import { therapistSchema, type TherapistFormData } from "../../schemas";
import {
  useCreateTherapist,
  useUpdateTherapist,
} from "../../mutations";
import type { Therapist } from "../../types";
import { DAY_OPTIONS, TIME_PRESETS } from "./constants";
import styles from "./therapist-form-modal.module.scss";

interface TherapistFormModalProps {
  open: boolean;
  onClose: () => void;
  therapist?: Therapist | null;
}

const EMPTY_DEFAULTS: TherapistFormData = {
  name: "",
  specialty: "",
  phone: "",
  email: "",
  qualifications: "",
  experience_years: undefined,
  bio: "",
  work_days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
  start_time: "09:00",
  end_time: "17:00",
  slot_minutes: 30,
  is_active: true,
};

export function TherapistFormModal({
  open,
  onClose,
  therapist,
}: TherapistFormModalProps) {
  const { message } = App.useApp();
  const isEdit = Boolean(therapist?.id);

  const createTherapist = useCreateTherapist();
  const updateTherapist = useUpdateTherapist();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useAppForm<typeof therapistSchema>(therapistSchema, EMPTY_DEFAULTS);

  useEffect(() => {
    if (!open) return;
    if (therapist) {
      reset({
        name: therapist.name,
        specialty: therapist.specialty,
        phone: therapist.phone ?? "",
        email: therapist.email ?? "",
        qualifications: therapist.qualifications ?? "",
        experience_years: therapist.experience_years ?? undefined,
        bio: therapist.bio ?? "",
        work_days: therapist.work_days,
        start_time: therapist.start_time.slice(0, 5),
        end_time: therapist.end_time.slice(0, 5),
        slot_minutes: therapist.slot_minutes,
        is_active: therapist.is_active,
      });
    } else {
      reset(EMPTY_DEFAULTS);
    }
  }, [open, therapist, reset]);

  const onSubmit = async (data: TherapistFormData) => {
    try {
      const payload = {
        ...data,
        phone: data.phone || null,
        email: data.email || null,
        qualifications: data.qualifications || null,
        experience_years: data.experience_years ?? null,
        bio: data.bio || null,
      };

      if (isEdit && therapist) {
        await updateTherapist.mutateAsync({ id: therapist.id, payload });
        message.success(`${data.name} updated.`);
      } else {
        await createTherapist.mutateAsync(payload);
        message.success(`${data.name} created.`);
      }
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong.";
      message.error(msg);
    }
  };

  const saving =
    isSubmitting || createTherapist.isPending || updateTherapist.isPending;

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit therapist" : "New therapist"}
      onCancel={onClose}
      width={640}
      heightVh={85}
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
            {isEdit ? "Save changes" : "Create therapist"}
          </Button>
        </div>
      }
    >
      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className={styles.grid}>
          <div className={styles.full}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Full name"
                  placeholder="e.g. Dr. Ramesh Sharma"
                  required
                  error={errors.name?.message}
                />
              )}
            />
          </div>

          <div className={styles.full}>
            <Controller
              name="specialty"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Specialty"
                  placeholder="e.g. Orthopedic Physiotherapy"
                  required
                  error={errors.specialty?.message}
                />
              )}
            />
          </div>

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Phone"
                placeholder="9841-XXXXXX"
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Email"
                type="email"
                placeholder="name@clinic.com"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            name="experience_years"
            control={control}
            render={({ field }) => (
              <Input
                label="Years of experience"
                type="number"
                placeholder="8"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === ""
                      ? undefined
                      : Number(e.target.value),
                  )
                }
                onBlur={field.onBlur}
                error={errors.experience_years?.message}
              />
            )}
          />

          <Controller
            name="slot_minutes"
            control={control}
            render={({ field }) => (
              <Input
                label="Slot length (minutes)"
                type="number"
                placeholder="30"
                value={field.value}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                onBlur={field.onBlur}
                error={errors.slot_minutes?.message}
              />
            )}
          />

          <div className={styles.full}>
            <Controller
              name="qualifications"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Qualifications"
                  placeholder="MPT Ortho, BPT"
                  error={errors.qualifications?.message}
                />
              )}
            />
          </div>

          <div className={styles.full}>
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  label="Short bio"
                  placeholder="Focus areas, notable experience, etc."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  error={errors.bio?.message}
                />
              )}
            />
          </div>

          <div className={styles.full}>
            <Controller
              name="work_days"
              control={control}
              render={({ field }) => (
                <div className={styles.field}>
                  <label className={styles.label}>
                    Work days<span className={styles.required}>*</span>
                  </label>
                  <Select
                    mode="multiple"
                    options={DAY_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    allowClear={false}
                    placeholder="Select working days"
                  />
                  {errors.work_days && (
                    <div className={styles.error}>
                      {errors.work_days.message}
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          <Controller
            name="start_time"
            control={control}
            render={({ field }) => (
              <div className={styles.field}>
                <label className={styles.label}>
                  Start time<span className={styles.required}>*</span>
                </label>
                <Select
                  options={TIME_PRESETS}
                  value={field.value}
                  onChange={field.onChange}
                  allowClear={false}
                />
                {errors.start_time && (
                  <div className={styles.error}>
                    {errors.start_time.message}
                  </div>
                )}
              </div>
            )}
          />

          <Controller
            name="end_time"
            control={control}
            render={({ field }) => (
              <div className={styles.field}>
                <label className={styles.label}>
                  End time<span className={styles.required}>*</span>
                </label>
                <Select
                  options={TIME_PRESETS}
                  value={field.value}
                  onChange={field.onChange}
                  allowClear={false}
                />
                {errors.end_time && (
                  <div className={styles.error}>
                    {errors.end_time.message}
                  </div>
                )}
              </div>
            )}
          />

          <div className={styles.full}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span>Active — available for new appointments</span>
                </label>
              )}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
