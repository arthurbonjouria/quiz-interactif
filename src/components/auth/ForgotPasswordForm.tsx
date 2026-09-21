"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export function ForgotPasswordForm({ portal, loginHref }: { portal: "admin" | "student"; loginHref: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, portal }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <MailCheck size={36} strokeWidth={1.5} className="text-brand" />
        <h1 className="text-xl font-bold">Email envoyé</h1>
        <p className="text-sm text-neutral-500">
          Si un compte existe avec cette adresse, vous recevrez un lien pour réinitialiser votre mot de passe.
        </p>
        <Link href={loginHref} className="mt-2 text-sm font-semibold text-brand hover:underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">Mot de passe oublié</h1>
      <p className="mb-8 text-sm text-neutral-500">Recevez un lien par email pour choisir un nouveau mot de passe.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-neutral-200 px-4 py-3 text-sm transition focus:border-brand focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:bg-brand disabled:opacity-50"
        >
          {loading ? "Envoi…" : "Envoyer le lien"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-neutral-400">
        <Link href={loginHref} className="font-medium text-brand hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </>
  );
}
