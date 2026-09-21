import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/admin/StatCard";

export default async function AdminDashboardPage() {
  const [companyCount, participantCount, finishedAttempts, campaigns, questionnaires, answerStats, folders] =
    await Promise.all([
      prisma.company.count({ where: { isPersonal: false } }),
      prisma.participant.count(),
      prisma.attempt.findMany({ where: { finishedAt: { not: null } }, select: { totalScore: true } }),
      prisma.campaign.count(),
      prisma.questionnaire.count(),
      prisma.answer.groupBy({ by: ["correct"], _count: { _all: true } }),
      prisma.folder.count(),
    ]);

  const avgScore =
    finishedAttempts.length > 0
      ? Math.round(finishedAttempts.reduce((s, a) => s + a.totalScore, 0) / finishedAttempts.length)
      : 0;

  const totalAnswers = answerStats.reduce((s, a) => s + a._count._all, 0);
  const correctAnswers = answerStats.find((a) => a.correct)?._count._all ?? 0;
  const globalSuccessRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : null;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold">Bonjour 👋</h1>
        <p className="text-sm text-neutral-500">Voici tout ce dont vous avez besoin pour gérer vos formations.</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">Que voulez-vous faire ?</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            href="/admin/questionnaires/new"
            emoji="📚"
            title="Importer un questionnaire"
            description="Ajoutez vos questions (import CSV ou saisie manuelle)."
          />
          <ActionCard
            href="/admin/campaigns/new"
            emoji="🎯"
            title="Créer une campagne"
            description="Choisissez un questionnaire, une entreprise, et obtenez un lien à partager."
          />
          <ActionCard
            href="/admin/campaigns"
            emoji="🔴"
            title="Lancer une session live"
            description="Depuis une campagne active, jouez en direct avec vos participants."
          />
          <ActionCard
            href="/admin/folders/new"
            emoji="📁"
            title="Inviter des étudiants"
            description="Regroupez des cours dans un dossier et envoyez les accès par email."
          />
        </div>
      </div>

      <HowItWorks />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">Vue d&apos;ensemble</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Questionnaires" value={questionnaires} />
          <StatCard label="Campagnes" value={campaigns} />
          <StatCard label="Dossiers" value={folders} />
          <StatCard label="Entreprises" value={companyCount} />
          <StatCard label="Participants" value={participantCount} />
          <StatCard label="Réussite globale" value={globalSuccessRate === null ? "—" : `${globalSuccessRate}%`} />
        </div>
      </div>

      <p className="text-xs text-neutral-400">
        {finishedAttempts.length} tentative(s) terminée(s) · Score moyen : {avgScore} points
      </p>
    </div>
  );
}

function ActionCard({
  href,
  emoji,
  title,
  description,
}: {
  href: string;
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="font-semibold text-ink">{title}</span>
      <span className="text-sm text-neutral-500">{description}</span>
      <span className="mt-1 text-sm font-semibold text-brand opacity-0 transition group-hover:opacity-100">
        Commencer →
      </span>
    </Link>
  );
}

function HowItWorks() {
  const steps = [
    {
      emoji: "📚",
      title: "1. Le questionnaire",
      description: "Vos questions et bonnes réponses, importées une fois — réutilisables pour plusieurs entreprises.",
    },
    {
      emoji: "🎯",
      title: "2. La campagne",
      description:
        "Un questionnaire donné à UNE entreprise, avec un lien unique à partager. Vidéo obligatoire en option.",
    },
    {
      emoji: "📁",
      title: "3. Le dossier (optionnel)",
      description: "Regroupez plusieurs campagnes et envoyez les accès par email à des étudiants précis.",
    },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Comment ça marche</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="flex flex-col gap-1">
            <span className="text-xl">{step.emoji}</span>
            <span className="text-sm font-semibold text-ink">{step.title}</span>
            <span className="text-sm text-neutral-500">{step.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
