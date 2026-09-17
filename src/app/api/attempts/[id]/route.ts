import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: params.id },
    include: {
      participant: true,
      answers: true,
      campaign: {
        include: {
          questionnaire: { include: { questions: { orderBy: { order: "asc" } } } },
        },
      },
    },
  });

  if (!attempt) {
    return NextResponse.json({ error: "Tentative introuvable" }, { status: 404 });
  }

  const answeredQuestionIds = new Set(attempt.answers.map((a) => a.questionId));

  return NextResponse.json({
    id: attempt.id,
    finishedAt: attempt.finishedAt,
    totalScore: attempt.totalScore,
    campaignCode: attempt.campaign.code,
    questionnaireTitle: attempt.campaign.questionnaire.title,
    questions: attempt.campaign.questionnaire.questions.map((q) => ({
      id: q.id,
      text: q.text,
      choices: JSON.parse(q.choices) as string[],
      points: q.points,
      timeLimitSec: q.timeLimitSec,
      order: q.order,
      answered: answeredQuestionIds.has(q.id),
    })),
  });
}
