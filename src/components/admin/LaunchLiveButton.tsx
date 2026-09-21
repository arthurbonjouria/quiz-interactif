"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";

export function LaunchLiveButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/admin/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    router.push(`/admin/live/${data.id}`);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:border-brand hover:text-brand disabled:opacity-50"
    >
      <Radio size={14} strokeWidth={2} />
      {loading ? "Démarrage…" : "Session live"}
    </button>
  );
}
