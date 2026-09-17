"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Questionnaire = { id: string; title: string; category: string };

export function NewCampaignForm({ questionnaires }: { questionnaires: Questionnaire[] }) {
  const router = useRouter();
  const [questionnaireId, setQuestionnaireId] = useState(questionnaires[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionnaireId,
        label,
        companyDomain,
        companyName: companyName || undefined,
        endsAt: endsAt || undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur lors de la création.");
      return;
    }
    setCreatedLink(`${window.location.origin}/s/${data.code}`);
  }

  if (createdLink) {
    return (
      <div className="max-w-lg rounded-xl border border-neutral-200 bg-white p-6">
        <p className="mb-2 text-sm font-medium">Campagne créée. Lien à transmettre :</p>
        <p className="mb-4 rounded-lg bg-neutral-100 px-4 py-2 font-mono text-sm">{createdLink}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(createdLink)}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand"
          >
            Copier le lien
          </button>
          <button onClick={() => router.push("/admin/campaigns")} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium">
            Voir les campagnes
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Questionnaire</label>
        <select
          required
          value={questionnaireId}
          onChange={(e) => setQuestionnaireId(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          {questionnaires.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Nom de la campagne</label>
        <input
          required
          placeholder="Ex. IA Act — Entreprise X — Sept. 2026"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Domaine email de l&apos;entreprise cliente</label>
        <input
          required
          placeholder="ex. client.fr"
          value={companyDomain}
          onChange={(e) => setCompanyDomain(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">
          Nom de l&apos;entreprise (optionnel, si nouveau domaine)
        </label>
        <input
          placeholder="Ex. Client SA"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Date de fin (optionnel)</label>
        <input
          type="date"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving || questionnaires.length === 0}
        className="self-start rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand disabled:opacity-50"
      >
        {saving ? "Création…" : "Créer la campagne"}
      </button>
      {questionnaires.length === 0 && (
        <p className="text-xs text-red-500">Créez d&apos;abord un questionnaire.</p>
      )}
    </form>
  );
}
