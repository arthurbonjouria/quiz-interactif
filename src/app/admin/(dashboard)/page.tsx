import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/admin/StatCard";

export default async function AdminDashboardPage() {
  const [companyCount, participantCount, finishedAttempts, campaigns, questionnaires, answerStats] = await Promise.all([
    prisma.company.count({ where: { isPersonal: false } }),
    prisma.participant.count(),
    prisma.attempt.findMany({ where: { finishedAt: { not: null } }, select: { totalScore: true } }),
    prisma.campaign.count(),
    prisma.questionnaire.count(),
    prisma.answer.groupBy({ by: ["correct"], _count: { _all: true } }),
  ]);

  const avgScore =
    finishedAttempts.length > 0
      ? Math.round(finishedAttempts.reduce((s, a) => s + a.totalScore, 0) / finishedAttempts.length)
      : 0;

  const totalAnswers = answerStats.reduce((s, a) => s + a._count._all, 0);
  const correctAnswers = answerStats.find((a) => a.correct)?._count._all ?? 0;
  const globalSuccessRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-neutral-500">Vue d&apos;ensemble de l&apos;activité.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Entreprises" value={companyCount} />
        <StatCard label="Participants" value={participantCount} />
        <StatCard label="Tentatives terminées" value={finishedAttempts.length} />
        <StatCard label="Score moyen" value={avgScore} />
        <StatCard label="Réussite globale" value={globalSuccessRate === null ? "—" : `${globalSuccessRate}%`} />
        <StatCard label="Questionnaires" value={questionnaires} />
      </div>

      <div className="flex gap-3">
        <Link href="/admin/questionnaires/new" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand">
          + Importer un questionnaire
        </Link>
        <Link href="/admin/campaigns/new" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:border-ink">
          + Nouvelle campagne
        </Link>
      </div>

      <p className="text-xs text-neutral-400">{campaigns} campagne(s) au total.</p>
    </div>
  );
}
