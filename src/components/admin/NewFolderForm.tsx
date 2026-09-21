"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Campaign = { id: string; label: string; questionnaireTitle: string; companyName: string };

export function NewFolderForm({ campaigns }: { campaigns: Campaign[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (selected.length === 0) {
      setError("Sélectionnez au moins un cours.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: description || undefined, campaignIds: selected }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur lors de la création.");
      return;
    }
    const data = await res.json();
    router.push(`/admin/folders/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Titre du dossier</label>
        <input
          required
          placeholder="Ex. Parcours IA Act complet"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Description (optionnel)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-neutral-500">Cours à inclure</label>
        <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4">
          {campaigns.map((c) => (
            <label key={c.id} className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
              <span className="font-medium">{c.label}</span>
              <span className="text-neutral-400">
                · {c.questionnaireTitle} · {c.companyName}
              </span>
            </label>
          ))}
          {campaigns.length === 0 && <p className="text-sm text-neutral-400">Aucune campagne disponible.</p>}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand disabled:opacity-50"
      >
        {saving ? "Création…" : "Créer le dossier"}
      </button>
    </form>
  );
}
