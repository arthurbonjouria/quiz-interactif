import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Logo } from "@/components/Logo";
import { computeGradeOutOf10 } from "@/lib/grade";

export default async function ResultPage({
  params,
}: {
  params: { code: string; attemptId: string };
}) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: params.attemptId },
    include: {
      participant: true,
      campaign: { include: { questionnaire: { include: { questions: true } } } },
      certificate: true,
      answers: true,
    },
  });

  if (!attempt || attempt.campaign.code !== params.code) notFound();

  const totalQuestions = attempt.campaign.questionnaire.questions.length;

  const finishedAttempts = await prisma.attempt.findMany({
    where: { campaignId: attempt.campaignId, finishedAt: { not: null } },
    include: { answers: true },
  });

  const myGrade = computeGradeOutOf10(attempt.answers.filter((a) => a.correct).length, totalQuestions);
  const average =
    finishedAttempts.length > 0
      ? Math.round(
          finishedAttempts.reduce(
            (s, a) => s + computeGradeOutOf10(a.answers.filter((ans) => ans.correct).length, totalQuestions),
            0
          ) / finishedAttempts.length
        )
      : myGrade;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <Logo className="h-8" />
      <p className="text-xs font-semibold uppercase tracking-widest text-brand">Terminé</p>
      <h1 className="text-3xl font-bold">Bravo {attempt.participant.firstName} !</h1>
      <p className="text-neutral-600">{attempt.campaign.questionnaire.title}</p>

      <div className="rounded-2xl bg-ink px-10 py-8 text-white">
        <p className="text-sm uppercase tracking-widest text-neutral-400">Votre note</p>
        <p className="text-5xl font-bold text-brand">{myGrade}/10</p>
      </div>

      <p className="text-sm text-neutral-600">
        Note moyenne dans votre entreprise pour ce questionnaire : <strong>{average}/10</strong>
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
