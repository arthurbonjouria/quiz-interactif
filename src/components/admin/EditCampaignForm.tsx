"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    <Card className="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nom de la campagne">
          <Input required value={label} onChange={(e) => setLabel(e.target.value)} />
        </Field>

        <Field label="Lien">
          <p className="rounded-xl bg-offwhite px-3.5 py-2.5 font-mono text-sm text-ink">/s/{campaign.code}</p>
        </Field>

        <Field
          label="Date de fin"
          hint="optionnel"
        >
          <Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          <p className="mt-1.5 text-xs text-cloudy">
            Après cette date, les nouvelles inscriptions ne seront plus acceptées. Laisser vide pour une campagne sans
            date de fin.
          </p>
        </Field>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-brand" />
          Campagne active (décochez pour désactiver immédiatement les nouvelles inscriptions)
        </label>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <Button type="submit" loading={saving} className="self-start">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </Card>
  );
}
