import { cn } from "@/lib/utils";

type AdatStatus = "AMAN" | "PARIBAN" | "PERLU_DICEK" | "DIBLOKIR";

const config: Record<
  AdatStatus,
  { label: string; bg: string; fg: string }
> = {
  AMAN: {
    label: "Sesuai adat",
    bg: "bg-adat-aman",
    fg: "text-adat-aman-fg",
  },
  PARIBAN: {
    label: "Marpariban",
    bg: "bg-adat-pariban",
    fg: "text-adat-pariban-fg",
  },
  PERLU_DICEK: {
    label: "Perlu dicek",
    bg: "bg-adat-cek",
    fg: "text-adat-cek-fg",
  },
  DIBLOKIR: {
    label: "Diblokir",
    bg: "bg-adat-blokir",
    fg: "text-adat-blokir-fg",
  },
};

interface StatusAdatBadgeProps {
  status: AdatStatus;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function StatusAdatBadge({
  status,
  label,
  size = "md",
  className,
}: StatusAdatBadgeProps) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        c.bg,
        c.fg,
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        className,
      )}
    >
      {label ?? c.label}
    </span>
  );
}
