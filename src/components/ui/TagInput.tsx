"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function TagInput({
  value,
  onChange,
  placeholder = "Ajouter un tag…",
  className,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-2.5 py-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15",
        className
      )}
    >
      {value.map((tag, i) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-soft px-2.5 py-1 text-xs font-medium text-brand"
        >
          {tag}
          <button type="button" onClick={() => removeAt(i)} className="hover:text-ink" aria-label={`Retirer ${tag}`}>
            <X size={11} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            removeAt(value.length - 1);
          }
        }}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[6rem] flex-1 bg-transparent py-0.5 text-sm text-ink placeholder:text-cloudy focus:outline-none"
      />
    </div>
  );
}
