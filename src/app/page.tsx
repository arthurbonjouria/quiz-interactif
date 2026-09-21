import Link from "next/link";
import {
  GraduationCap,
  LayoutDashboard,
  Radio,
  FolderOpen,
  BookOpen,
  Trophy,
  BarChart3,
  Users,
  ShieldCheck,
  Award,
  ArrowRight,
  Check,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Banque de questionnaires",
    description: "Créez vos questions une fois, taguez-les par thème, et réutilisez-les d'une campagne à l'autre.",
  },
  {
    icon: Radio,
    title: "Sessions live façon Kahoot",
    description: "Projetez un quiz en direct, code PIN et QR code à l'écran, podium en temps réel.",
  },
  {
    icon: FolderOpen,
    title: "Dossiers de cours",
    description: "Regroupez plusieurs campagnes et invitez vos étudiants par email en un clic.",
  },
  {
    icon: Award,
    title: "Certificats automatiques",
    description: "Note sur 10 calculée et certificat PDF généré dès la fin du parcours, envoyé par email.",
  },
  {
    icon: BarChart3,
    title: "Suivi & analytics",
    description: "Taux de complétion et de réussite par entreprise, exports PDF/CSV prêts pour vos clients RH.",
  },
  {
    icon: Users,
    title: "Multi-formateurs",
    description: "Chaque formateur gère ses propres campagnes ; vous gardez une vue d'ensemble complète.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Créez un questionnaire",
    description: "Importez vos questions par CSV ou piochez-les dans votre bibliothèque existante.",
  },
  {
    number: "02",
    title: "Lancez une campagne",
    description: "Associez-le à une entreprise cliente et obtenez un lien à partager, ou lancez une session live.",
  },
  {
    number: "03",
    title: "Suivez les résultats",
    description: "Certificats, notes et statistiques de progression, consultables à tout moment.",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-offwhite">
      <header className="border-b border-neutral-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo className="h-7" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-500 sm:flex">
            <a href="#fonctionnalites" className="hover:text-ink">
              Fonctionnalités
            </a>
            <a href="#comment-ca-marche" className="hover:text-ink">
              Comment ça marche
            </a>
          </nav>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link href="/student/login" className="hidden text-neutral-500 hover:text-ink sm:block">
              Espace étudiant
            </Link>
            <Link
              href="/admin/login"
              className="rounded-lg bg-ink px-4 py-2 text-white transition hover:bg-brand"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="animate-float-blob pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-soft opacity-70 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-40 h-64 w-64 rounded-full bg-brand/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
              <ShieldCheck size={13} strokeWidth={2.5} /> Certifié Qualiopi
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              Faites adopter l&apos;IA à vos équipes,
              <span className="text-brand"> un quiz à la fois.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-neutral-500">
              La plateforme d&apos;évaluation et de formation interactive de BONJOUR IA : questionnaires réutilisables,
              sessions live, certificats automatiques et suivi de vos collaborateurs.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/admin/login"
                className="group flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand"
              >
                Espace formateur
                <ArrowRight size={16} strokeWidth={2.5} className="transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/student/login"
                className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
              >
                <GraduationCap size={16} strokeWidth={2.5} /> Espace étudiant
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-neutral-400">
              <Check size={15} strokeWidth={2.5} className="text-brand" />
              Sans engagement — vos identifiants vous sont envoyés par email.
            </div>
          </div>

          <div className="relative">
            <div className="animate-pop-in rounded-3xl bg-ink p-6 shadow-[0_30px_60px_-20px_rgba(45,45,45,0.35)] sm:p-8">
              <div className="mb-5 flex items-center justify-between text-white/70">
                <span className="text-xs font-semibold uppercase tracking-widest">Session live</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">PIN 482913</span>
              </div>
              <div className="mb-5 rounded-2xl bg-white p-5">
                <p className="text-center text-base font-bold text-ink">
                  Quelle obligation impose l&apos;IA Act pour un système à haut risque ?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["Transparence totale", "Aucune", "Validation humaine", "Anonymisation"].map((choice, i) => (
                  <div
                    key={choice}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold text-white ${
                      ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"][i]
                    } ${i === 2 ? "ring-2 ring-white" : "opacity-80"}`}
                  >
                    {choice}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between text-white">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Trophy size={15} strokeWidth={2} className="text-brand" /> 18 joueurs
                </span>
                <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
                  <span className="block h-full w-2/3 rounded-full bg-brand" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">Fonctionnalités</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Tout pour former et évaluer, sans friction</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-soft text-brand">
                <f.icon size={20} strokeWidth={2} />
              </span>
              <h3 className="font-semibold text-ink">{f.title}</h3>
              <p className="text-sm text-neutral-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="comment-ca-marche" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand">Comment ça marche</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Trois étapes, aucune friction</h2>
          </div>

          <div className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-lg font-bold text-white">
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                <p className="max-w-xs text-sm text-neutral-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual audience CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.08)] sm:p-10">
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

          <div className="flex flex-col gap-4 rounded-3xl bg-ink p-8 text-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.2)] sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/20 text-brand">
              <LayoutDashboard size={22} strokeWidth={2} />
            </span>
            <h2 className="text-xl font-bold">Je suis formateur</h2>
            <p className="text-sm text-white/60">
              Créez vos questionnaires, lancez des campagnes et des sessions live, suivez la progression de vos
              apprenants.
            </p>
            <div className="mt-auto flex flex-wrap gap-3">
              <Link
                href="/admin/login"
                className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Se connecter
              </Link>
              <Link
                href="/formateur/inscription"
                className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
              >
                Demander un accès
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center">
          <Logo className="h-6" />
          <p className="text-xs leading-relaxed text-neutral-400">
            BONJOUR IA — Cabinet de Conseil IA &amp; Organisme de Formation
            <br />
            SIRET 43358085900026 · N° DA : 83630345463 · Certifié Qualiopi — Actions de Formation
            <br />
            19, Avenue Marx Dormoy — 63000 Clermont-Ferrand · 04 73 34 14 27 · contact@bonjouria.fr
          </p>
        </div>
      </footer>
    </main>
  );
}
