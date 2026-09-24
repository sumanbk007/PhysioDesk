"use client";

import { Input as AntInput } from "antd";
import type { InputProps as AntInputProps } from "antd";
import { forwardRef, useId } from "react";
import styles from "./input.module.scss";

export interface InputProps extends AntInputProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, required, id, className, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const showMeta = Boolean(hint || error);

    return (
      <div className={styles.field}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <AntInput
          ref={ref}
          id={inputId}
          status={error ? "error" : undefined}
          className={[styles.input, className].filter(Boolean).join(" ")}
          {...rest}
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
);

Input.displayName = "Input";
