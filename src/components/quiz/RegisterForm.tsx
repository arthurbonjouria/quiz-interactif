"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm({ code, accentColor }: { code: string; accentColor?: string | null }) {
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
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, firstName, lastName, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      if (data.alreadyFinished) {
        router.push(`/s/${code}/result/${data.attemptId}`);
      } else if (data.hasVideo) {
        router.push(`/s/${code}/video?attempt=${data.attemptId}`);
      } else {
        router.push(`/s/${code}/play?attempt=${data.attemptId}`);
      }
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
        style={accentColor ? { backgroundColor: accentColor } : undefined}
        className={`rounded-lg py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${
          accentColor ? "hover:opacity-90" : "bg-ink hover:bg-brand"
        }`}
      >
        {loading ? "Chargement…" : "Commencer le questionnaire"}
      </button>
      <p className="text-center text-xs text-neutral-500">
        Vos données (nom, prénom, email, réponses) sont utilisées uniquement pour le suivi de votre parcours de
        formation par BONJOUR IA et votre employeur, dans le respect du RGPD.
      </p>
    </form>
  );
}
