"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

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
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <Card>
        <div className="flex flex-col gap-4">
          <Field label="Titre du dossier">
            <Input required placeholder="Ex. Parcours IA Act complet" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Description" hint="optionnel">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </Field>
        </div>
      </Card>

      <Field label={`Cours à inclure (${selected.length} sélectionné${selected.length > 1 ? "s" : ""})`}>
        <div className="flex flex-col gap-2 rounded-2xl border border-ink/10 bg-white p-3">
          {campaigns.map((c) => (
            <label
              key={c.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                selected.includes(c.id) ? "bg-soft/50" : "hover:bg-offwhite"
              )}
            >
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                onChange={() => toggle(c.id)}
                className="h-4 w-4 accent-brand"
              />
              <span className="font-semibold text-ink">{c.label}</span>
              <span className="text-cloudy">
                · {c.questionnaireTitle} · {c.companyName}
              </span>
            </label>
          ))}
          {campaigns.length === 0 && <p className="px-3 py-2 text-sm text-cloudy">Aucune campagne disponible.</p>}
        </div>
      </Field>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <Button type="submit" loading={saving} className="self-start">
        {saving ? "Création…" : "Créer le dossier"}
      </Button>
    </form>
  );
}
