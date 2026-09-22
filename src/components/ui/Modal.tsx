"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function Modal({
  title,
  onClose,
  children,
  footer,
  maxWidth = "max-w-2xl",
}: {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        className={cn("flex max-h-[85vh] w-full flex-col rounded-2xl bg-white shadow-2xl", maxWidth)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 p-4">
          <h2 className="font-semibold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="text-cloudy hover:text-ink" aria-label="Fermer">
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-ink/10 p-4">{footer}</div>}
      </div>
    </div>
  );
}
