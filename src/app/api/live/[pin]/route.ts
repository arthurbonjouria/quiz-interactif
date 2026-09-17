import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatDisplayName } from "@/lib/display-name";

export async function GET(_req: Request, { params }: { params: { pin: string } }) {
  const session = await prisma.liveSession.findUnique({
    where: { pin: params.pin },
    include: {
      campaign: {
        include: {
          questionnaire: { include: { questions: { orderBy: { order: "asc" } } } },
          company: true,
        },
      },
      attempts: {
        include: { participant: true },
      },
    },
  });

  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });

  const questions = session.campaign.questionnaire.questions;
  const currentQuestion = questions[session.currentIndex] ?? null;

  const top3 = [...session.attempts]
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 3)
    .map((a) => ({
      name: formatDisplayName(a.participant.firstName, a.participant.lastName),
      score: a.totalScore,
    }));

  return NextResponse.json({
    id: session.id,
    pin: session.pin,
    status: session.status,
    currentIndex: session.currentIndex,
    questionStartedAt: session.questionStartedAt,
    totalQuestions: questions.length,
    questionnaireTitle: session.campaign.questionnaire.title,
    companyName: session.campaign.company.name,
    campaignCode: session.campaign.code,
    currentQuestion: currentQuestion
      ? {
          id: currentQuestion.id,
          text: currentQuestion.text,
          choices: JSON.parse(currentQuestion.choices) as string[],
          points: currentQuestion.points,
          timeLimitSec: currentQuestion.timeLimitSec,
        }
      : null,
    top3,
  });
}
