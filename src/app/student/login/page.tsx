"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("student", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push("/student");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-10 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)]">
        <Logo className="mb-8 h-8" />
        <h1 className="mb-1 text-2xl font-bold">Mon espace</h1>
        <p className="mb-8 text-sm text-neutral-500">Retrouvez vos cours et vos résultats.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-neutral-200 px-4 py-3 text-sm transition focus:border-brand focus:outline-none"
          />
          <input
            required
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-neutral-200 px-4 py-3 text-sm transition focus:border-brand focus:outline-none"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-ink py-3 text-sm font-semibold text-white transition hover:bg-brand disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-neutral-400">
          Vos identifiants vous ont été envoyés par email lors de votre inscription à un cours.
        </p>
      </div>
      <Link href="/" className="mt-6 text-xs text-neutral-400 hover:text-ink">
        ← Retour à l&apos;accueil
      </Link>
    </main>
  );
}
