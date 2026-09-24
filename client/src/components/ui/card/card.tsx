"use client";

import { Card as AntCard } from "antd";
import type { CardProps as AntCardProps } from "antd";
import styles from "./card.module.scss";

export interface CardProps extends AntCardProps {
  padded?: boolean;
}

export function Card({ padded = true, className, ...rest }: CardProps) {
  return (
    <AntCard
      bordered={false}
      className={[styles.card, padded ? styles.padded : styles.flush, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
