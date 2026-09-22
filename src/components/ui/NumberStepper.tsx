"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}) {
  function clamp(n: number) {
    let v = n;
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    return v;
  }

  return (
    <div className={cn("flex items-center rounded-xl border border-ink/15 bg-white", className)}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-l-xl text-cloudy transition hover:bg-soft/60 hover:text-brand"
        aria-label="Diminuer"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/[^0-9-]/g, ""), 10);
          onChange(clamp(Number.isNaN(n) ? 0 : n));
        }}
        className="w-12 flex-1 border-x border-ink/10 bg-transparent py-2 text-center text-sm font-semibold text-ink focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-r-xl text-cloudy transition hover:bg-soft/60 hover:text-brand"
        aria-label="Augmenter"
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
