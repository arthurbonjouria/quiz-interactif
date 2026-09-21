import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Logo } from "@/components/Logo";

export default async function ResultPage({
  params,
}: {
  params: { code: string; attemptId: string };
}) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: params.attemptId },
    include: {
      participant: true,
      campaign: { include: { questionnaire: true } },
      certificate: true,
    },
  });

  if (!attempt || attempt.campaign.code !== params.code) notFound();

  const finishedAttempts = await prisma.attempt.findMany({
    where: { campaignId: attempt.campaignId, finishedAt: { not: null } },
    select: { totalScore: true },
  });
  const companyAverage =
    finishedAttempts.length > 0
      ? Math.round(finishedAttempts.reduce((s, a) => s + a.totalScore, 0) / finishedAttempts.length)
      : attempt.totalScore;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <Logo className="h-8" />
      <p className="text-xs font-semibold uppercase tracking-widest text-brand">Terminé</p>
      <h1 className="text-3xl font-bold">Bravo {attempt.participant.firstName} !</h1>
      <p className="text-neutral-600">{attempt.campaign.questionnaire.title}</p>

      <div className="rounded-2xl bg-ink px-10 py-8 text-white">
        <p className="text-sm uppercase tracking-widest text-neutral-400">Votre score</p>
        <p className="text-5xl font-bold text-brand">{attempt.totalScore}</p>
      </div>

      <p className="text-sm text-neutral-600">
        Score moyen dans votre entreprise pour ce questionnaire : <strong>{companyAverage}</strong>
      </p>

      {attempt.certificate ? (
        <a
          href={`/api/attempts/${attempt.id}/certificate`}
          className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Télécharger mon certificat
        </a>
      ) : (
        <p className="text-sm text-neutral-500">Votre certificat est en cours de génération…</p>
      )}
    </main>
  );
}
