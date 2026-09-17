"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CsvImportForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("IA_ACT");
  const [csv, setCsv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsv(await file.text());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/questionnaires/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, csv }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Import impossible.");
      return;
    }
    router.push("/admin/questionnaires");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          required
          placeholder="Titre du questionnaire"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="POSITIONNEMENT">Positionnement</option>
          <option value="IA_ACT">IA Act</option>
          <option value="ACQUIS">Acquis de compétences</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">
          Fichier CSV (colonnes : question, choix1, choix2, choix3, choix4, bonne_reponse, points, temps_limite)
        </label>
        <input type="file" accept=".csv" onChange={handleFile} required className="text-sm" />
      </div>

      {csv && <p className="text-xs text-neutral-500">{csv.trim().split("\n").length - 1} ligne(s) détectée(s).</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving || !csv}
        className="self-start rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand disabled:opacity-50"
      >
        {saving ? "Import en cours…" : "Importer"}
      </button>
    </form>
  );
}
