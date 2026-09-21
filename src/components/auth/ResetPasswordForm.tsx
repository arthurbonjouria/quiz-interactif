"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export function ResetPasswordForm({ portal, loginHref }: { portal: "admin" | "student"; loginHref: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, portal }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push(loginHref), 2000);
  }

  if (!token) {
    return (
      <p className="text-sm text-red-600">
        Lien invalide.{" "}
        <Link href={`${loginHref.replace("/login", "/forgot-password")}`} className="font-semibold text-brand hover:underline">
          Demander un nouveau lien
        </Link>
      </p>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 size={36} strokeWidth={1.5} className="text-brand" />
        <h1 className="text-xl font-bold">Mot de passe mis à jour</h1>
        <p className="text-sm text-neutral-500">Redirection vers la connexion…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Nouveau mot de passe</h1>
      <p className="mb-8 text-sm text-neutral-500">Choisissez un nouveau mot de passe (8 caractères minimum).</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          required
          type="password"
          minLength={8}
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-neutral-200 px-4 py-3 text-sm transition focus:border-brand focus:outline-none"
        />
        <input
          required
          type="password"
          minLength={8}
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="rounded-xl border border-neutral-200 px-4 py-3 text-sm transition focus:border-brand focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:bg-brand disabled:opacity-50"
        >
          {loading ? "Enregistrement…" : "Réinitialiser mon mot de passe"}
        </button>
      </form>
    </>
  );
}
