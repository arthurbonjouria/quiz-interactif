"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

type SearchResult = {
  type: string;
  label: string;
  sublabel: string | null;
  href: string;
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher…"
          className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-8 pr-7 text-sm focus:border-brand focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-ink"
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-96 w-full min-w-[280px] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
          {loading && <p className="p-3 text-xs text-neutral-400">Recherche…</p>}
          {!loading && results.length === 0 && <p className="p-3 text-xs text-neutral-400">Aucun résultat.</p>}
          {!loading &&
            results.map((r, i) => (
              <Link
                key={i}
                href={r.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 border-b border-neutral-50 px-3 py-2 text-sm last:border-0 hover:bg-neutral-50"
              >
                <span>
                  <span className="font-medium text-ink">{r.label}</span>
                  {r.sublabel && <span className="ml-1 text-xs text-neutral-400">{r.sublabel}</span>}
                </span>
                <span className="shrink-0 rounded-full bg-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand">
                  {r.type}
                </span>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
