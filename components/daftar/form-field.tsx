"use client";

import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (name: string, value: string) => void;
  type?: "text" | "email" | "number" | "select" | "textarea";
  placeholder?: string;
  /** String biasa (nilai = teks), atau {value, label} bila teks yang tampil perlu
   *  berbeda dari nilai yang disimpan (mis. label dipersingkat). */
  options?: readonly (string | { value: string; label: string })[];
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
    "w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

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
          // Padding kiri-kanan dilonggarkan di layar <=380px supaya opsi panjang
          // (mis. "Batak Angkola/Mandailing") muat di dropdown.
          className={`${baseClass} max-[380px]:px-3`}
          required={required}
        >
          <option value="">{placeholder || "Pilih..."}</option>
          {options?.map((opt) => {
            const value = typeof opt === "string" ? opt : opt.value;
            const text = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
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
