"use client";

import { useEffect, useState } from "react";
import { X, Search, Plus } from "lucide-react";

type BankQuestion = {
  id: string;
  text: string;
  choices: string[];
  correctIndex: number;
  points: number;
  timeLimitSec: number;
  tags: string[];
  questionnaireTitle: string;
};

export function QuestionBankPicker({
  excludeQuestionnaireId,
  onImport,
  onClose,
}: {
  excludeQuestionnaireId?: string;
  onImport: (questions: BankQuestion[]) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [results, setResults] = useState<BankQuestion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);
    if (excludeQuestionnaireId) params.set("excludeQuestionnaireId", excludeQuestionnaireId);

    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/admin/questions?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data.questions);
          setAllTags(data.allTags);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search, tag, excludeQuestionnaireId]);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleImport() {
    onImport(results.filter((q) => selected.has(q.id)));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 p-4">
          <h2 className="font-semibold text-ink">Banque de questions</h2>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-ink">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-2 border-b border-neutral-100 p-4">
          <div className="relative">
            <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              autoFocus
              placeholder="Rechercher une question…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 py-2 pl-8 pr-3 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setTag("")}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${tag === "" ? "bg-ink text-white" : "bg-neutral-100 text-neutral-600"}`}
              >
                Tous
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${tag === t ? "bg-brand text-white" : "bg-neutral-100 text-neutral-600"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && <p className="text-sm text-neutral-400">Recherche…</p>}
          {!loading && results.length === 0 && (
            <p className="text-sm text-neutral-400">Aucune question ne correspond.</p>
          )}
          <div className="flex flex-col gap-2">
            {results.map((q) => (
              <label
                key={q.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                  selected.has(q.id) ? "border-brand bg-soft/30" : "border-neutral-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(q.id)}
                  onChange={() => toggle(q.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className="font-medium text-ink">{q.text}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {q.questionnaireTitle}
                    {q.tags.length > 0 && ` · ${q.tags.join(", ")}`}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 p-4">
          <span className="text-xs text-neutral-500">{selected.size} sélectionnée(s)</span>
          <button
            type="button"
            onClick={handleImport}
            disabled={selected.size === 0}
            className="flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand disabled:opacity-40"
          >
            <Plus size={14} strokeWidth={2} /> Importer la sélection
          </button>
        </div>
      </div>
    </div>
  );
}
