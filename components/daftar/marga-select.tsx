"use client";

import { useState, useRef, useEffect } from "react";
import { semuaMarga } from "@/lib/adat";

const DAFTAR_MARGA = semuaMarga();

export function MargaSelect({
  value,
  onChange,
  label = "Marga",
  name = "marga",
  required,
}: {
  value: string;
  onChange: (name: string, value: string) => void;
  label?: string;
  name?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = search
    ? DAFTAR_MARGA.filter((m) =>
        m.toLowerCase().includes(search.toLowerCase()),
      )
    : DAFTAR_MARGA;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="space-y-2" ref={ref}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={open ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setSearch("");
          }}
          placeholder={value || "Ketik untuk mencari marga..."}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          required={required}
        />
        {value && !open && (
          <button
            type="button"
            onClick={() => {
              onChange(name, "");
              setSearch("");
              setOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
        {open && (
          <div className="absolute top-full left-0 z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Marga tidak ditemukan
              </div>
            ) : (
              filtered.slice(0, 50).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    onChange(name, m);
                    setSearch("");
                    setOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors ${
                    m === value
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))
            )}
            {filtered.length > 50 && (
              <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
                Ketik lebih spesifik — {filtered.length - 50} marga lagi
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
