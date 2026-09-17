import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { finishAttempt } from "@/lib/finish-attempt";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const session = await prisma.liveSession.findUnique({
    where: { id: params.id },
    include: {
      campaign: { include: { questionnaire: { include: { questions: true } } } },
      attempts: true,
    },
  });
  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  if (session.status !== "REVEAL") {
    return NextResponse.json({ error: "Il faut d'abord révéler la réponse en cours." }, { status: 409 });
  }

  const totalQuestions = session.campaign.questionnaire.questions.length;
  const nextIndex = session.currentIndex + 1;

  if (nextIndex >= totalQuestions) {
    const updated = await prisma.liveSession.update({
      where: { id: params.id },
      data: { status: "FINISHED" },
    });

    await Promise.all(session.attempts.map((a) => finishAttempt(a.id).catch((err) => console.error(err))));

    return NextResponse.json(updated);
  }

  const updated = await prisma.liveSession.update({
    where: { id: params.id },
    data: { currentIndex: nextIndex, status: "QUESTION", questionStartedAt: new Date() },
  });

  return NextResponse.json(updated);
}
