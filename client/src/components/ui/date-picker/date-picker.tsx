"use client";

import { DatePicker as AntDatePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useId } from "react";
import styles from "./date-picker.module.scss";

export interface DatePickerProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  showTime?: boolean;
  placeholder?: string;
  disabled?: boolean;
  format?: string;
  className?: string;
}

function toDayjs(value: string | null | undefined): Dayjs | null {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d : null;
}

export function DatePicker({
  value,
  onChange,
  label,
  required,
  error,
  hint,
  showTime = false,
  placeholder,
  disabled,
  format,
  className,
}: DatePickerProps) {
  const autoId = useId();
  const inputId = autoId;
  const showMeta = Boolean(hint || error);

  const resolvedFormat = format ?? (showTime ? "DD MMM YYYY, HH:mm" : "DD MMM YYYY");

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <AntDatePicker
        id={inputId}
        value={toDayjs(value)}
        onChange={(d) => onChange(d ? d.toISOString() : null)}
        showTime={showTime}
        format={resolvedFormat}
        placeholder={placeholder ?? (showTime ? "Pick date & time" : "Pick a date")}
        disabled={disabled}
        status={error ? "error" : undefined}
        className={styles.picker}
        allowClear
      />

      {showMeta && (
        <div className={styles.meta}>
          {error ? (
            <span className={styles.error}>{error}</span>
          ) : (
            <span className={styles.hint}>{hint}</span>
          )}
        </div>
      )}
    </div>
  );
}
