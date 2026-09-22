"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, CheckCircle2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Invitee = { firstName: string; lastName: string; email: string };

const EMPTY: Invitee = { firstName: "", lastName: "", email: "" };

export function InviteToFolderForm({ folderId }: { folderId: string }) {
  const router = useRouter();
  const [invitees, setInvitees] = useState<Invitee[]>([{ ...EMPTY }]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(index: number, patch: Partial<Invitee>) {
    setInvitees((list) => list.map((inv, i) => (i === index ? { ...inv, ...patch } : inv)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    const res = await fetch(`/api/admin/folders/${folderId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitees }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur lors de l'invitation.");
      return;
    }
    const data = await res.json();
    setSuccess(`${data.invited} étudiant(s) invité(s) avec succès.`);
    setInvitees([{ ...EMPTY }]);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader title="Inviter des étudiants à tout ce dossier" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {invitees.map((inv, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <Input required placeholder="Prénom" value={inv.firstName} onChange={(e) => update(i, { firstName: e.target.value })} className="w-32" />
            <Input required placeholder="Nom" value={inv.lastName} onChange={(e) => update(i, { lastName: e.target.value })} className="w-32" />
            <Input
              required
              type="email"
              placeholder="Email"
              value={inv.email}
              onChange={(e) => update(i, { email: e.target.value })}
              className="min-w-[200px] flex-1"
            />
            {invitees.length > 1 && (
              <button
                type="button"
                onClick={() => setInvitees((list) => list.filter((_, idx) => idx !== i))}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-cloudy transition hover:bg-red-50 hover:text-red-600"
                aria-label="Retirer"
              >
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setInvitees((list) => [...list, { ...EMPTY }])}
          className="self-start"
        >
          <Plus size={13} strokeWidth={2.5} /> Ajouter un étudiant
        </Button>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        {success && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-brand">
            <CheckCircle2 size={14} strokeWidth={2} /> {success}
          </p>
        )}

        <Button type="submit" loading={saving} className="self-start">
          {saving ? "Envoi…" : "Envoyer les invitations"}
        </Button>
      </form>
    </Card>
  );
}
