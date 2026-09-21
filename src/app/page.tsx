import Link from "next/link";
import { GraduationCap, LayoutDashboard, Radio, FolderOpen, BookOpen, Trophy } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-offwhite">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 sm:py-16">
        <Logo className="h-8" />

        <div className="mt-14 flex flex-col items-center text-center sm:mt-20">
          <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
            BONJOUR IA
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
            Faites adopter l&apos;IA à vos équipes, un quiz à la fois.
          </h1>
          <p className="mt-4 max-w-xl text-neutral-500 sm:text-lg">
            La plateforme d&apos;évaluation et de formation interactive de BONJOUR IA : questionnaires, sessions live
            façon Kahoot, et suivi de vos collaborateurs.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.08)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft text-brand">
              <GraduationCap size={22} strokeWidth={2} />
            </span>
            <h2 className="text-xl font-bold">Je suis étudiant</h2>
            <p className="text-sm text-neutral-500">
              Retrouvez vos cours, vos résultats et vos certificats. Vos identifiants vous ont été envoyés par email
              lors de votre inscription à un cours.
            </p>
            <Link
              href="/student/login"
              className="mt-auto self-start rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand"
            >
              Accéder à mon espace
            </Link>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.08)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft text-brand">
              <LayoutDashboard size={22} strokeWidth={2} />
            </span>
            <h2 className="text-xl font-bold">Je suis formateur</h2>
            <p className="text-sm text-neutral-500">
              Créez vos questionnaires, lancez des campagnes et des sessions live, suivez la progression de vos
              apprenants.
            </p>
            <div className="mt-auto flex flex-wrap gap-3">
              <Link
                href="/admin/login"
                className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand"
              >
                Se connecter
              </Link>
              <Link
                href="/formateur/inscription"
                className="rounded-xl border border-neutral-300 px-6 py-3 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
              >
                Demander un accès
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 sm:mt-24 sm:grid-cols-4">
          <Feature icon={BookOpen} label="Questionnaires réutilisables" />
          <Feature icon={Radio} label="Sessions live" />
          <Feature icon={FolderOpen} label="Dossiers de cours" />
          <Feature icon={Trophy} label="Certificats automatiques" />
        </div>
      </div>

      <footer className="border-t border-neutral-200 px-6 py-6 text-center text-xs text-neutral-400">
        BONJOUR IA — Cabinet de conseil, formation et application IA
      </footer>
    </main>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof BookOpen; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Icon size={20} strokeWidth={2} className="text-brand" />
      <span className="text-xs font-medium text-neutral-500">{label}</span>
    </div>
  );
}
