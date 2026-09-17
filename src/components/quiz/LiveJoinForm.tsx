"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LiveJoinForm({ pin }: { pin: string }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/live/${pin}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      router.push(`/play/${pin}/game?attempt=${data.attemptId}`);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex gap-3">
        <input
          required
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-1/2 rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-brand focus:outline-none"
        />
        <input
          required
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-1/2 rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      <input
        required
        type="email"
        placeholder="Email professionnel"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-brand focus:outline-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-ink py-3 text-sm font-semibold text-white transition hover:bg-brand disabled:opacity-50"
      >
        {loading ? "Connexion…" : "Rejoindre la partie"}
      </button>
    </form>
  );
}
