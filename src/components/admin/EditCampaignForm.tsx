"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Campaign = {
  id: string;
  label: string;
  code: string;
  endsAt: string | null;
  active: boolean;
};

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function EditCampaignForm({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [label, setLabel] = useState(campaign.label);
  const [endsAt, setEndsAt] = useState(toDateInputValue(campaign.endsAt));
  const [active, setActive] = useState(campaign.active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, endsAt: endsAt || null, active }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Erreur lors de l'enregistrement.");
      return;
    }
    router.push("/admin/campaigns");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Nom de la campagne</label>
        <input
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Lien</label>
        <p className="rounded-lg bg-neutral-100 px-3 py-2 font-mono text-sm">/s/{campaign.code}</p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Date de fin (optionnel)</label>
        <input
          type="date"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-xs text-neutral-400">
          Après cette date, les nouvelles inscriptions ne seront plus acceptées. Laisser vide pour une campagne sans
          date de fin.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Campagne active (décochez pour désactiver immédiatement les nouvelles inscriptions)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
