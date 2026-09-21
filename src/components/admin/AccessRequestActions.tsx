"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export function AccessRequestActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDecision(decision: "approve" | "reject") {
    if (decision === "reject" && !confirm("Refuser cette demande d'accès ?")) return;
    setLoading(decision);
    setError(null);

    const res = await fetch(`/api/admin/access-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });

    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
        onClick={() => handleDecision("approve")}
        disabled={loading !== null}
        className="flex items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-brand disabled:opacity-50"
      >
        <Check size={12} strokeWidth={2.5} /> {loading === "approve" ? "…" : "Approuver"}
      </button>
      <button
        onClick={() => handleDecision("reject")}
        disabled={loading !== null}
        className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-red-400 hover:text-red-600 disabled:opacity-50"
      >
        <X size={12} strokeWidth={2.5} /> Refuser
      </button>
    </div>
  );
}
