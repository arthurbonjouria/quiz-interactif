"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/cn";

export function FileDropzone({
  onFile,
  accept,
  label = "Glissez un fichier ici, ou cliquez pour parcourir",
  hint,
  disabled = false,
  className,
}: {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && !disabled) onFile(file);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition",
        dragOver ? "border-brand bg-soft/40" : "border-ink/15 hover:border-brand hover:bg-soft/20",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-soft text-brand">
        <UploadCloud size={18} strokeWidth={2} />
      </span>
      <p className="text-sm font-medium text-ink">{label}</p>
      {hint && <p className="text-xs text-cloudy">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
