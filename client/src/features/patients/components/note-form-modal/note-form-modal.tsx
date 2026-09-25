"use client";

import { App } from "antd";
import { useEffect } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Button, DatePicker, Input, Modal, Select } from "@/components/ui";
import { useAppForm } from "@/hooks/use-app-form";
import { useTherapists } from "@/features/therapists/queries";
import { noteSchema, type NoteFormData } from "../../schemas";
import { useCreateNote, useUpdateNote } from "../../mutations";
import type { ClinicalNote } from "../../types";
import styles from "./note-form-modal.module.scss";

interface NoteFormModalProps {
  open: boolean;
  onClose: () => void;
  patientId: number;
  note?: ClinicalNote | null;
  defaultTherapistId?: number;
  onSaved?: (noteId: number) => void;
}

const EMPTY_DEFAULTS: NoteFormData = {
  therapist_id: 0,
  note_date: null,
  chief_complaint: "",
  pain_location: "",
  pain_score: null,
  diagnosis: "",
  assessment: "",
  rom: "",
  rom_score: null,
  strength: "",
  strength_score: null,
  special_tests: "",
  treatment: "",
  exercises: "",
  patient_response: "",
  hep: "",
  plan: "",
  therapist_notes: "",
  milestone: "",
};

export function NoteFormModal({
  open,
  onClose,
  patientId,
  note,
  defaultTherapistId,
  onSaved,
}: NoteFormModalProps) {
  const { message } = App.useApp();
  const isEdit = Boolean(note?.id);

  const therapists = useTherapists({ page: 1, page_size: 100 });
  const therapistOptions = (therapists.data?.items ?? []).map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const createNote = useCreateNote(patientId);
  const updateNote = useUpdateNote(patientId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useAppForm<typeof noteSchema>(noteSchema, EMPTY_DEFAULTS);

  useEffect(() => {
    if (!open) return;

    if (note) {
      reset({
        therapist_id: note.therapist_id,
        note_date: note.note_date ?? null,
        chief_complaint: note.chief_complaint ?? "",
        pain_location: note.pain_location ?? "",
        pain_score: note.pain_score,
        diagnosis: note.diagnosis ?? "",
        assessment: note.assessment ?? "",
        rom: note.rom ?? "",
        rom_score: note.rom_score,
        strength: note.strength ?? "",
        strength_score: note.strength_score,
        special_tests: note.special_tests ?? "",
        treatment: note.treatment ?? "",
        exercises: note.exercises ?? "",
        patient_response: note.patient_response ?? "",
        hep: note.hep ?? "",
        plan: note.plan ?? "",
        therapist_notes: note.therapist_notes ?? "",
        milestone: note.milestone ?? "",
      });
    } else {
      reset({
        ...EMPTY_DEFAULTS,
        therapist_id: defaultTherapistId ?? 0,
      });
    }
  }, [open, note, defaultTherapistId, reset]);

  const onSubmit = async (data: NoteFormData) => {
    try {
      if (isEdit && note) {
        const updated = await updateNote.mutateAsync({
          id: note.id,
          payload: data,
        });
        message.success("Note updated.");
        onSaved?.(updated.id);
      } else {
        const created = await createNote.mutateAsync(data);
        message.success("Note created.");
        onSaved?.(created.id);
      }
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not save the note.";
      message.error(msg);
    }
  };

  const saving =
    isSubmitting || createNote.isPending || updateNote.isPending;

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit clinical note" : "New clinical note"}
      onCancel={onClose}
      width={760}
      heightVh={88}
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
            {isEdit ? "Save changes" : "Create note"}
          </Button>
        </div>
      }
    >
      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className={styles.row}>
          <Controller
            name="therapist_id"
            control={control}
            render={({ field }) => (
              <div className={styles.field}>
                <label className={styles.label}>
                  Therapist<span className={styles.required}>*</span>
                </label>
                <Select
                  options={therapistOptions}
                  value={field.value || undefined}
                  onChange={field.onChange}
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
            name="note_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Note date"
                showTime
                value={field.value ?? null}
                onChange={(v) => field.onChange(v)}
              />
            )}
          />
        </div>

        <Section title="Subjective">
          <Field name="chief_complaint" control={control} label="Chief complaint" textarea />
          <Field name="pain_location" control={control} label="Pain location" />
          <NumericField
            name="pain_score"
            control={control}
            label="Pain intensity (0–10)"
            error={errors.pain_score?.message}
          />
        </Section>

        <Section title="Objective">
          <Field name="assessment" control={control} label="Assessment findings" textarea />
          <div className={styles.row}>
            <Field name="rom" control={control} label="Range of motion" />
            <NumericField
              name="rom_score"
              control={control}
              label="ROM score (0–100% of normal)"
              error={errors.rom_score?.message}
            />
          </div>
          <div className={styles.row}>
            <Field name="strength" control={control} label="Muscle strength" />
            <NumericField
              name="strength_score"
              control={control}
              label="Strength grade (0–5 MMT)"
              error={errors.strength_score?.message}
            />
          </div>
          <Field name="special_tests" control={control} label="Special tests" textarea />
        </Section>

        <Section title="Assessment">
          <Field
            name="diagnosis"
            control={control}
            label="Diagnosis / clinical impression"
            textarea
          />
        </Section>

        <Section title="Plan & Treatment">
          <Field name="treatment" control={control} label="Treatment provided" textarea />
          <Field name="exercises" control={control} label="Exercises given" textarea />
          <Field name="patient_response" control={control} label="Patient response" textarea />
          <Field name="hep" control={control} label="Home exercise program (HEP)" textarea />
          <Field name="plan" control={control} label="Next-session plan" textarea />
        </Section>

        <Section title="Internal">
          <Field name="therapist_notes" control={control} label="Therapist notes (internal)" textarea />
          <Field name="milestone" control={control} label="Milestone (leave blank if none)" />
        </Section>
      </form>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function Field<T extends FieldValues>({
  name,
  control,
  label,
  textarea,
}: {
  name: Path<T>;
  control: Control<T>;
  label: string;
  textarea?: boolean;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) =>
        textarea ? (
          <Input.TextArea
            {...field}
            value={field.value ?? ""}
            label={label}
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        ) : (
          <Input
            {...field}
            value={field.value ?? ""}
            label={label}
          />
        )
      }
    />
  );
}

function NumericField<T extends FieldValues>({
  name,
  control,
  label,
  error,
}: {
  name: Path<T>;
  control: Control<T>;
  label: string;
  error?: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          label={label}
          type="number"
          value={
            field.value === null || field.value === undefined
              ? ""
              : String(field.value)
          }
          onChange={(e) =>
            field.onChange(e.target.value === "" ? null : e.target.value)
          }
          onBlur={field.onBlur}
          error={error}
        />
      )}
    />
  );
}
