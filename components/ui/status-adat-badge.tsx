import { Crown, CircleCheck, CircleHelp, Ban, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdatStatus = "AMAN" | "PARIBAN" | "PERLU_DICEK" | "DIBLOKIR";

const config: Record<
  AdatStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  PARIBAN: {
    label: "Marpariban",
    icon: Crown,
    className: "bg-adat-pariban/10 text-adat-pariban",
  },
  AMAN: {
    label: "Sesuai adat",
    icon: CircleCheck,
    className: "bg-adat-aman/10 text-adat-aman",
  },
  PERLU_DICEK: {
    label: "Perlu dicek",
    icon: CircleHelp,
    className: "bg-adat-cek/10 text-adat-cek",
  },
  DIBLOKIR: {
    // Satu-satunya status dengan background solid, bukan tint — beda bentuk, bukan cuma beda warna
    label: "Diblokir",
    icon: Ban,
    className: "bg-adat-blokir text-white",
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
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        c.className,
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label ?? c.label}
    </span>
  );
}
