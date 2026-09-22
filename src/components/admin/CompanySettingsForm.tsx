"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
  const [confirmingMerge, setConfirmingMerge] = useState(false);
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

  const mergeTarget = otherCompanies.find((c) => c.id === mergeIntoId);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <form onSubmit={handleRename} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label="Nom" className="flex-1">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Domaine" className="flex-1">
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} />
          </Field>
          <Button type="submit" loading={saving}>
            Enregistrer
          </Button>
        </form>
      </Card>

      {otherCompanies.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50/30 p-6 shadow-[0_2px_16px_-4px_rgba(45,45,45,0.08)]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-600">Zone sensible</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="Fusionner dans une autre entreprise" hint="Déplace participants et campagnes" className="flex-1">
              <Select value={mergeIntoId} onChange={(e) => setMergeIntoId(e.target.value)}>
                <option value="">Sélectionner…</option>
                {otherCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.domain})
                  </option>
                ))}
              </Select>
            </Field>
            <Button
              type="button"
              variant="danger"
              onClick={() => setConfirmingMerge(true)}
              disabled={saving || !mergeIntoId}
            >
              Fusionner
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {confirmingMerge && mergeTarget && (
        <ConfirmDialog
          title="Fusionner cette entreprise ?"
          description={
            <>
              Tous les participants et campagnes seront déplacés définitivement vers{" "}
              <strong>{mergeTarget.name}</strong>. Cette action est irréversible.
            </>
          }
          confirmLabel="Fusionner définitivement"
          danger
          onClose={() => setConfirmingMerge(false)}
          onConfirm={async () => {
            await handleMerge();
            setConfirmingMerge(false);
          }}
        />
      )}
    </div>
  );
}
