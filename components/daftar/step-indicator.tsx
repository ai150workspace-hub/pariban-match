"use client";

const STEPS = [
  "Data Pribadi",
  "Latar Belakang",
  "Preferensi",
  "Kepribadian",
  "Bio Profil",
];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {STEPS.map((label, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-primary/20 text-primary"
                      : "bg-border text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className={`hidden text-sm sm:inline ${
                  isActive
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 rounded-full sm:w-12 ${
                  isDone ? "bg-primary/30" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
