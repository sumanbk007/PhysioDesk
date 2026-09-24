"use client";

import { Input as AntInput } from "antd";
import type { InputProps as AntInputProps, InputRef } from "antd";
import { forwardRef, useId } from "react";
import styles from "./input.module.scss";

export interface InputProps extends AntInputProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

type PasswordProps = React.ComponentProps<typeof AntInput.Password>;

function FieldShell({
  label,
  hint,
  error,
  required,
  inputId,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  inputId: string;
  children: React.ReactNode;
}) {
  const showMeta = Boolean(hint || error);
  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {children}
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

const BaseInput = forwardRef<InputRef, InputProps>(
  ({ label, hint, error, required, id, className, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <FieldShell
        label={label}
        hint={hint}
        error={error}
        required={required}
        inputId={inputId}
      >
        <AntInput
          ref={ref}
          id={inputId}
          status={error ? "error" : undefined}
          className={[styles.input, className].filter(Boolean).join(" ")}
          {...rest}
        />
      </FieldShell>
    );
  }
);
BaseInput.displayName = "Input";

const PasswordInput = forwardRef<InputRef, InputProps & PasswordProps>(
  ({ label, hint, error, required, id, className, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <FieldShell
        label={label}
        hint={hint}
        error={error}
        required={required}
        inputId={inputId}
      >
        <AntInput.Password
          ref={ref}
          id={inputId}
          status={error ? "error" : undefined}
          className={[styles.input, className].filter(Boolean).join(" ")}
          {...rest}
        />
      </FieldShell>
    );
  }
);
PasswordInput.displayName = "Input.Password";

export const Input = Object.assign(BaseInput, {
  Password: PasswordInput,
});
