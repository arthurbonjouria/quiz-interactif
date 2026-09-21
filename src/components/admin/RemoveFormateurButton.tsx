"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function RemoveFormateurButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(`Supprimer le compte de ${name} ? Ses campagnes existantes resteront visibles pour vous.`)) return;
    setLoading(true);
    const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      <Trash2 size={12} strokeWidth={2} /> Supprimer
    </button>
  );
}
