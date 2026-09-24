import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = "Rs") {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return `${currency} 0`;
  return `${currency} ${n.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(
  date: string | Date,
  variant: "short" | "long" | "time" | "datetime" = "short"
) {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const opts: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: "2-digit", month: "short" },
    long: { day: "2-digit", month: "short", year: "numeric" },
    time: { hour: "2-digit", minute: "2-digit", hour12: true },
    datetime: {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
  };
  return new Intl.DateTimeFormat("en-GB", opts[variant]).format(d);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
