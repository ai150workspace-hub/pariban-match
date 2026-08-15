"use client";

import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (name: string, value: string) => void;
  type?: "text" | "email" | "number" | "select" | "textarea";
  placeholder?: string;
  options?: readonly string[];
  required?: boolean;
  children?: ReactNode;
}

export function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  options,
  required,
}: FormFieldProps) {
  const baseClass =
    "w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className={baseClass}
          required={required}
        >
          <option value="">{placeholder || "Pilih..."}</option>
          {options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className={`${baseClass} min-h-[100px] resize-y`}
          required={required}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className={baseClass}
          required={required}
        />
      )}
    </div>
  );
}
