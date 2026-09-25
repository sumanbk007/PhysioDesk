"use client";

import { Divider as AntDivider } from "antd";

interface DividerProps {
  spacing?: number;
}

export function Divider({ spacing = 16 }: DividerProps) {
  return (
    <AntDivider
      style={{
        marginTop: spacing,
        marginBottom: spacing,
        borderColor: "var(--color-brand-border, #e2e8f0)",
      }}
    />
  );
}
