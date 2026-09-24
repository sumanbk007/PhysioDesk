"use client";

import { Select as AntSelect } from "antd";
import type { SelectProps as AntSelectProps } from "antd";
import styles from "./select.module.scss";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps
  extends Omit<AntSelectProps, "options" | "children"> {
  options: SelectOption[];
  placeholder?: string;
  allowClear?: boolean;
}

export function Select({
  options,
  placeholder,
  allowClear = true,
  className,
  ...rest
}: SelectProps) {
  return (
    <AntSelect
      options={options}
      placeholder={placeholder}
      allowClear={allowClear}
      className={[styles.select, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
