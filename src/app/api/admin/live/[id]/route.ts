import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isOwner, adminId } from "@/lib/require-admin";
import { formatDisplayName } from "@/lib/display-name";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { session: adminSession, response } = await requireAdmin();
  if (response) return response;

  const session = await prisma.liveSession.findUnique({
    where: { id: params.id },
    include: {
      campaign: {
        include: {
          questionnaire: { include: { questions: { orderBy: { order: "asc" } } } },
          company: true,
        },
      },
      attempts: {
        include: {
          participant: true,
          answers: true,
        },
        orderBy: { startedAt: "asc" },
      },
    },
  });

  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  if (!isOwner(adminSession) && session.campaign.createdById !== adminId(adminSession)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const questions = session.campaign.questionnaire.questions;
  const currentQuestion = questions[session.currentIndex] ?? null;

  const players = session.attempts.map((a) => {
    const currentAnswer = currentQuestion ? a.answers.find((ans) => ans.questionId === currentQuestion.id) : undefined;
    return {
      attemptId: a.id,
      name: formatDisplayName(a.participant.firstName, a.participant.lastName),
      score: a.totalScore,
      answeredCurrent: Boolean(currentAnswer),
    };
  });

  const answerDistribution = currentQuestion
    ? (JSON.parse(currentQuestion.choices) as string[]).map((_, i) =>
        session.attempts
          .flatMap((a) => a.answers)
          .filter((ans) => {
            if (ans.questionId !== currentQuestion.id) return false;
            if (currentQuestion.type === "MULTIPLE") {
              return (JSON.parse(ans.choiceIndexes) as number[]).includes(i);
            }
            return ans.choiceIndex === i;
          }).length
      )
    : [];

  return NextResponse.json({
    id: session.id,
    pin: session.pin,
    status: session.status,
    currentIndex: session.currentIndex,
    questionStartedAt: session.questionStartedAt,
    totalQuestions: questions.length,
    questionnaireTitle: session.campaign.questionnaire.title,
    companyName: session.campaign.company.name,
    currentQuestion: currentQuestion
      ? {
          id: currentQuestion.id,
          text: currentQuestion.text,
          choices: JSON.parse(currentQuestion.choices) as string[],
          type: currentQuestion.type,
          correctIndex: currentQuestion.correctIndex,
          correctIndexes: JSON.parse(currentQuestion.correctIndexes) as number[],
          points: currentQuestion.points,
          timeLimitSec: currentQuestion.timeLimitSec,
        }
      : null,
    answerDistribution,
    players: players.sort((a, b) => b.score - a.score),
  });
}
