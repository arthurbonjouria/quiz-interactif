"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Questionnaire = { id: string; title: string; category: string };

export function NewCampaignForm({
  questionnaires,
  defaultQuestionnaireId,
}: {
  questionnaires: Questionnaire[];
  defaultQuestionnaireId?: string;
}) {
  const router = useRouter();
  const [questionnaireId, setQuestionnaireId] = useState(
    defaultQuestionnaireId && questionnaires.some((q) => q.id === defaultQuestionnaireId)
      ? defaultQuestionnaireId
      : (questionnaires[0]?.id ?? "")
  );
  const [label, setLabel] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      <Card className="max-w-lg">
        <p className="mb-3 text-sm font-semibold text-ink">Campagne créée. Lien à transmettre :</p>
        <p className="mb-4 break-all rounded-xl bg-soft/50 px-4 py-3 font-mono text-sm text-ink">{createdLink}</p>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(createdLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
            {copied ? "Copié" : "Copier le lien"}
          </Button>
          <Button variant="secondary" onClick={() => router.push("/admin/campaigns")}>
            Voir les campagnes
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Questionnaire">
          <Select required value={questionnaireId} onChange={(e) => setQuestionnaireId(e.target.value)}>
            {questionnaires.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Nom de la campagne">
          <Input
            required
            placeholder="Ex. IA Act — Entreprise X — Sept. 2026"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </Field>

        <Field label="Domaine email de l'entreprise cliente">
          <Input required placeholder="ex. client.fr" value={companyDomain} onChange={(e) => setCompanyDomain(e.target.value)} />
        </Field>

        <Field label="Nom de l'entreprise" hint="optionnel, si nouveau domaine">
          <Input placeholder="Ex. Client SA" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </Field>

        <Field label="Date de fin" hint="optionnel">
          <Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </Field>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <Button type="submit" loading={saving} disabled={questionnaires.length === 0} className="self-start">
          {saving ? "Création…" : "Créer la campagne"}
        </Button>
        {questionnaires.length === 0 && (
          <p className="text-xs text-red-500">Créez d&apos;abord un questionnaire.</p>
        )}
      </form>
    </Card>
  );
}
