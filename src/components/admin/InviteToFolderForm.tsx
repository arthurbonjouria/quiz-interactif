"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="text-sm font-semibold">Inviter des étudiants à tout ce dossier</h2>
      {invitees.map((inv, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <input
            required
            placeholder="Prénom"
            value={inv.firstName}
            onChange={(e) => update(i, { firstName: e.target.value })}
            className="w-32 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <input
            required
            placeholder="Nom"
            value={inv.lastName}
            onChange={(e) => update(i, { lastName: e.target.value })}
            className="w-32 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={inv.email}
            onChange={(e) => update(i, { email: e.target.value })}
            className="flex-1 min-w-[200px] rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          {invitees.length > 1 && (
            <button
              type="button"
              onClick={() => setInvitees((list) => list.filter((_, idx) => idx !== i))}
              className="text-xs text-red-600 hover:underline"
            >
              Retirer
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => setInvitees((list) => [...list, { ...EMPTY }])}
        className="self-start rounded-lg border border-dashed border-neutral-400 px-4 py-1.5 text-xs font-medium text-neutral-600 hover:border-brand hover:text-brand"
      >
        + Ajouter un étudiant
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand disabled:opacity-50"
      >
        {saving ? "Envoi…" : "Envoyer les invitations"}
      </button>
    </form>
  );
}
