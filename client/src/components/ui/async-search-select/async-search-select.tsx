"use client";

import { useEffect, useState } from "react";
import { Input, Select } from "@/components/ui";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export interface AsyncSearchOption {
  value: number | string;
  label: string;
  sublabel?: string;
}

interface AsyncSearchSelectProps {
  value?: number | string;
  onChange: (value: number | string | undefined) => void;
  onSearch: (search: string) => Promise<AsyncSearchOption[]>;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  minSearchLength?: number;
}

export function AsyncSearchSelect({
  value,
  onChange,
  onSearch,
  placeholder = "Search…",
  label,
  required,
  error,
  disabled,
  minSearchLength = 2,
}: AsyncSearchSelectProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [options, setOptions] = useState<AsyncSearchOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (debouncedSearch.trim().length < minSearchLength) {
      setOptions([]);
      return;
    }

    setLoading(true);
    onSearch(debouncedSearch.trim())
      .then((results) => {
        if (!cancelled) setOptions(results);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, onSearch, minSearchLength]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--brand-text)",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {label}
          {required && <span style={{ color: "#f43f5e" }}>*</span>}
        </label>
      )}
      <Select
        showSearch
        filterOption={false}
        onSearch={setSearch}
        value={value}
        onChange={(v) => onChange(v as number | string | undefined)}
        options={options}
        placeholder={placeholder}
        notFoundContent={loading ? "Searching…" : "Type to search"}
        allowClear
        disabled={disabled}
        loading={loading}
      />
      {error && (
        <div style={{ fontSize: 12, color: "#f43f5e", lineHeight: 1.4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
