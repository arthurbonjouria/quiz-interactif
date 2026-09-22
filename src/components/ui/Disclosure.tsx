"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function Disclosure({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-semibold text-ink"
      >
        <ChevronDown size={14} strokeWidth={2.5} className={cn("text-cloudy transition", open && "rotate-180")} />
        {label}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
