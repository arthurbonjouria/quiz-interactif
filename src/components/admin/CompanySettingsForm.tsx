"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OtherCompany = { id: string; name: string; domain: string };

export function CompanySettingsForm({
  companyId,
  initialName,
  initialDomain,
  otherCompanies,
}: {
  companyId: string;
  initialName: string;
  initialDomain: string;
  otherCompanies: OtherCompany[];
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [domain, setDomain] = useState(initialDomain);
  const [mergeIntoId, setMergeIntoId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, domain }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Erreur lors de la mise à jour.");
      return;
    }
    router.refresh();
  }

  async function handleMerge() {
    if (!mergeIntoId) return;
    if (!confirm("Fusionner définitivement cette entreprise dans l'entreprise sélectionnée ?")) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mergeIntoId }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Erreur lors de la fusion.");
      return;
    }
    router.push(`/admin/companies/${mergeIntoId}`);
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-5">
      <form onSubmit={handleRename} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Nom</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Domaine</label>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <button type="submit" disabled={saving} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand disabled:opacity-50">
          Enregistrer
        </button>
      </form>

      {otherCompanies.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Fusionner dans une autre entreprise (déplace participants et campagnes)
            </label>
            <select
              value={mergeIntoId}
              onChange={(e) => setMergeIntoId(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            >
              <option value="">Sélectionner…</option>
              {otherCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.domain})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleMerge}
            disabled={saving || !mergeIntoId}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Fusionner
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
