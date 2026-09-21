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
  QrCode,
  Tag,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const STEPS = [
  {
    number: "01",
    title: "Créez un questionnaire",
    description: "Importez vos questions par CSV ou piochez-les dans votre bibliothèque existante, taguées par thème.",
  },
  {
    number: "02",
    title: "Lancez une campagne",
    description: "Associez-le à une entreprise cliente et obtenez un lien à partager, ou lancez une session live.",
  },
  {
    number: "03",
    title: "Suivez les résultats",
    description: "Certificats, notes et statistiques de progression, exportables pour vos comptes-rendus RH.",
  },
];

const STUDENT_POINTS = [
  "Vos cours et résultats regroupés au même endroit",
  "Certificat téléchargeable dès la fin du parcours",
  "Accès immédiat, identifiants reçus par email",
];

const FORMATEUR_POINTS = [
  "Banque de questions réutilisable d'une campagne à l'autre",
  "Sessions live projetées, façon Kahoot",
  "Suivi analytics et exports prêts pour vos clients",
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-offwhite font-heading">
      <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/80 backdrop-blur">
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
            <Link href="/admin/login" className="rounded-lg bg-ink px-4 py-2 text-white transition hover:bg-brand">
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(45,45,45,0.10)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_20%,transparent_75%)]"
        />
        <div
          aria-hidden
          className="animate-float-blob pointer-events-none absolute -right-32 -top-32 h-[440px] w-[440px] rounded-full bg-soft opacity-70 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-40 h-64 w-64 rounded-full bg-brand/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-20 pt-16 sm:pb-28 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:pt-28">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
              <ShieldCheck size={13} strokeWidth={2.5} /> Certifié Qualiopi
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.5rem]">
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

            {/* Floating certificate chip for depth */}
            <div className="animate-pop-in absolute -bottom-8 -left-6 hidden w-52 -rotate-3 rounded-2xl bg-white p-4 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] sm:block">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-brand">
                  <Award size={16} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink">Certificat délivré</p>
                  <p className="text-[11px] text-neutral-400">Note : 9/10</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission pull-quote */}
      <section className="bg-ink py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
            « L&apos;IA n&apos;est pas le sujet.
            <br className="hidden sm:block" /> Le sujet, c&apos;est les équipes face à l&apos;IA. »
          </p>
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-brand">BONJOUR IA</p>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">Fonctionnalités</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Tout pour former et évaluer, sans friction</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Large card: question bank */}
          <div className="flex flex-col gap-5 rounded-3xl border border-neutral-200 bg-white p-8 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-soft text-brand">
              <BookOpen size={20} strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-ink">Banque de questionnaires</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Créez vos questions une fois, taguez-les par thème, et réutilisez-les d&apos;une campagne à l&apos;autre.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["RGPD", "IA générative", "Cybersécurité", "IA Act"].map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500"
                >
                  <Tag size={11} strokeWidth={2} /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Large card: live sessions */}
          <div className="flex flex-col gap-5 rounded-3xl border border-neutral-200 bg-white p-8 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-soft text-brand">
              <Radio size={20} strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-ink">Sessions live façon Kahoot</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Projetez un quiz en direct, code PIN et QR code à l&apos;écran, podium en temps réel.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white">
                <QrCode size={16} strokeWidth={2} />
              </span>
              <div className="text-xs">
                <p className="font-semibold text-ink">Rejoindre : /play/482913</p>
                <p className="text-neutral-400">Scan &amp; jouez depuis un téléphone</p>
              </div>
            </div>
          </div>

          {/* Small cards */}
          <SmallFeature
            icon={FolderOpen}
            title="Dossiers de cours"
            description="Regroupez plusieurs campagnes et invitez vos étudiants par email en un clic."
          />
          <SmallFeature
            icon={Award}
            title="Certificats automatiques"
            description="Note sur 10 calculée et certificat PDF généré dès la fin du parcours."
          />
          <SmallFeature
            icon={BarChart3}
            title="Suivi & analytics"
            description="Taux de complétion et de réussite par entreprise, exports PDF/CSV."
          />
          <SmallFeature
            icon={Users}
            title="Multi-formateurs"
            description="Chaque formateur gère ses propres campagnes, sous votre supervision."
          />
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
            <div
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-neutral-200 sm:block"
              style={{ marginInline: "16.5%" }}
            />
            {STEPS.map((step) => (
              <div key={step.number} className="relative flex flex-col items-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-lg font-bold text-white ring-8 ring-white">
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                <p className="max-w-xs text-sm text-neutral-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual audience */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-3xl bg-white p-8 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.08)] sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-soft text-brand">
              <GraduationCap size={22} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-bold">Je suis étudiant</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Retrouvez vos cours, vos résultats et vos certificats, envoyés par email lors de votre inscription à
                un cours.
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {STUDENT_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-brand" /> {point}
                </li>
              ))}
            </ul>
            <Link
              href="/student/login"
              className="mt-auto self-start rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand"
            >
              Accéder à mon espace
            </Link>
          </div>

          <div className="flex flex-col gap-5 rounded-3xl bg-ink p-8 text-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.2)] sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/20 text-brand">
              <LayoutDashboard size={22} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-xl font-bold">Je suis formateur</h2>
              <p className="mt-2 text-sm text-white/60">
                Créez vos questionnaires, lancez des campagnes et des sessions live, suivez la progression de vos
                apprenants.
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {FORMATEUR_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-white/80">
                  <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-brand" /> {point}
                </li>
              ))}
            </ul>
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

      {/* Final CTA banner */}
      <section className="bg-brand py-14 sm:py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-6 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Prêt à faire gagner du temps utile à vos équipes ?
          </h2>
          <p className="max-w-lg text-sm text-white/85">
            Demandez un accès formateur, ou contactez BONJOUR IA pour organiser vos premières campagnes.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/formateur/inscription"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:bg-offwhite"
            >
              Demander un accès formateur
            </Link>
            <a
              href="mailto:contact@bonjouria.fr"
              className="rounded-xl border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <Logo className="h-6" />
            <p className="text-xs leading-relaxed text-neutral-400">
              Cabinet de Conseil IA &amp; Organisme de Formation.
              <br />
              Faire adopter l&apos;IA par les femmes et les hommes qui font l&apos;entreprise.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <p className="mb-1 font-semibold text-ink">Accès</p>
            <Link href="/student/login" className="text-neutral-500 hover:text-brand">
              Espace étudiant
            </Link>
            <Link href="/admin/login" className="text-neutral-500 hover:text-brand">
              Espace formateur
            </Link>
            <Link href="/formateur/inscription" className="text-neutral-500 hover:text-brand">
              Demander un accès
            </Link>
          </div>

          <div className="flex flex-col gap-1 text-xs leading-relaxed text-neutral-400">
            <p className="mb-1 font-semibold text-ink">BONJOUR IA</p>
            <p>SIRET 43358085900026</p>
            <p>N° DA : 83630345463 · Certifié Qualiopi</p>
            <p>19, Avenue Marx Dormoy — 63000 Clermont-Ferrand</p>
            <p>04 73 34 14 27 · contact@bonjouria.fr</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SmallFeature({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof BookOpen;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-soft text-brand">
        <Icon size={20} strokeWidth={2} />
      </span>
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="text-sm text-neutral-500">{description}</p>
    </div>
  );
}
