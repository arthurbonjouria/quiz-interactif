"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

type SearchResult = {
  type: string;
  label: string;
  sublabel: string | null;
  href: string;
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => setResults(data.results))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Rechercher"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition",
          open ? "bg-soft text-brand" : "text-cloudy hover:bg-offwhite hover:text-ink"
        )}
      >
        <Search size={16} strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(90vw,340px)] overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl">
          <div className="relative border-b border-ink/10">
            <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-cloudy" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un participant, une campagne…"
              className="w-full bg-transparent py-3 pl-9 pr-8 text-sm text-ink placeholder:text-cloudy focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cloudy hover:text-ink"
                aria-label="Effacer"
              >
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          {query.trim().length >= 2 && (
            <div className="max-h-96 overflow-y-auto">
              {loading && <p className="p-3 text-xs text-cloudy">Recherche…</p>}
              {!loading && results.length === 0 && <p className="p-3 text-xs text-cloudy">Aucun résultat.</p>}
              {!loading &&
                results.map((r, i) => (
                  <Link
                    key={i}
                    href={r.href}
                    onClick={close}
                    className="flex items-center justify-between gap-2 border-b border-ink/5 px-3 py-2.5 text-sm last:border-0 hover:bg-offwhite"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">{r.label}</span>
                      {r.sublabel && <span className="block truncate text-xs text-cloudy">{r.sublabel}</span>}
                    </span>
                    <span className="shrink-0 rounded-full bg-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                      {r.type}
                    </span>
                  </Link>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
