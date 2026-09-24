"use client";

import { Button as AntButton } from "antd";
import type { ButtonProps as AntButtonProps } from "antd";
import { forwardRef } from "react";
import styles from "./button.module.scss";

export type ButtonVariant = "primary" | "default" | "text" | "link" | "dashed";
export type ButtonSize = "small" | "middle" | "large";
export type ButtonTone = "default" | "danger";

export interface ButtonProps
  extends Omit<AntButtonProps, "type" | "size" | "danger" | "variant"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "middle", tone = "default", className, ...rest }, ref) => {
    return (
      <AntButton
        ref={ref}
        type={variant}
        size={size}
        danger={tone === "danger"}
        className={[styles.button, className].filter(Boolean).join(" ")}
        {...rest}
      />
    );
  }
);

Button.displayName = "Button";
