import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { computeScore } from "@/lib/scoring";

const bodySchema = z.object({
  questionId: z.string().min(1),
  choiceIndex: z.number().int().min(0).nullable(),
  responseTimeMs: z.number().min(0),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const { questionId, choiceIndex, responseTimeMs } = parsed.data;

  const attempt = await prisma.attempt.findUnique({ where: { id: params.id } });
  if (!attempt) return NextResponse.json({ error: "Tentative introuvable" }, { status: 404 });
  if (attempt.finishedAt) return NextResponse.json({ error: "Tentative déjà terminée" }, { status: 409 });

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) return NextResponse.json({ error: "Question introuvable" }, { status: 404 });

  const existing = await prisma.answer.findUnique({
    where: { attemptId_questionId: { attemptId: attempt.id, questionId } },
  });
  if (existing) {
    return NextResponse.json({
      correct: existing.correct,
      correctIndex: question.correctIndex,
      pointsEarned: existing.pointsEarned,
    });
  }

  const clampedTime = Math.min(Math.max(responseTimeMs, 0), question.timeLimitSec * 1000);
  const correct = choiceIndex !== null && choiceIndex === question.correctIndex;
  const pointsEarned = computeScore({
    correct,
    points: question.points,
    responseTimeMs: clampedTime,
    timeLimitSec: question.timeLimitSec,
  });

  await prisma.$transaction([
    prisma.answer.create({
      data: {
        attemptId: attempt.id,
        questionId,
        choiceIndex,
        correct,
        responseTimeMs: clampedTime,
        pointsEarned,
      },
    }),
    prisma.attempt.update({
      where: { id: attempt.id },
      data: { totalScore: { increment: pointsEarned } },
    }),
  ]);

  return NextResponse.json({ correct, correctIndex: question.correctIndex, pointsEarned });
}
