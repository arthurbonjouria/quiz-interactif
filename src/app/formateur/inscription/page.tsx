"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CheckCircle2 } from "lucide-react";

export default function FormateurInscriptionPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/formateur/access-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message: message || undefined }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur lors de l'envoi de la demande.");
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-white p-10 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)]">
        <Logo className="mb-8 h-8" />

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 size={40} strokeWidth={1.5} className="text-brand" />
            <h1 className="text-xl font-bold">Demande envoyée</h1>
            <p className="text-sm text-neutral-500">
              Votre demande d&apos;accès formateur a bien été transmise. Vous recevrez vos identifiants par email dès
              qu&apos;elle sera validée par l&apos;équipe BONJOUR IA.
            </p>
            <Link href="/" className="mt-2 text-sm font-semibold text-brand hover:underline">
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-2xl font-bold">Devenir formateur</h1>
            <p className="mb-8 text-sm text-neutral-500">
              Demandez un accès au back-office BONJOUR IA. Un administrateur valide chaque demande avant création de
              compte.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                required
                placeholder="Nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-neutral-200 px-4 py-3 text-sm transition focus:border-brand focus:outline-none"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-neutral-200 px-4 py-3 text-sm transition focus:border-brand focus:outline-none"
              />
              <textarea
                placeholder="Un mot sur votre besoin (optionnel)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm transition focus:border-brand focus:outline-none"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:bg-brand disabled:opacity-50"
              >
                {loading ? "Envoi…" : "Envoyer ma demande"}
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-neutral-400">
              Déjà un compte ?{" "}
              <Link href="/admin/login" className="font-medium text-brand hover:underline">
                Se connecter
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
