"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-offwhite px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <Logo className="mb-6 h-9" />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
          />
          <input
            required
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-ink py-2.5 text-sm font-semibold text-white transition hover:bg-brand disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-neutral-400">
          Pas encore de compte ?{" "}
          <Link href="/formateur/inscription" className="font-medium text-brand hover:underline">
            Demander un accès
          </Link>
        </p>
      </div>
      <Link href="/" className="mt-6 text-xs text-neutral-400 hover:text-ink">
        ← Retour à l&apos;accueil
      </Link>
    </main>
  );
}
