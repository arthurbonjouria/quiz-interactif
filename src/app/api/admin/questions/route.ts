import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const tag = searchParams.get("tag")?.trim() ?? "";
  const excludeQuestionnaireId = searchParams.get("excludeQuestionnaireId") ?? undefined;

  const questions = await prisma.question.findMany({
    where: {
      ...(excludeQuestionnaireId ? { questionnaireId: { not: excludeQuestionnaireId } } : {}),
      ...(search ? { text: { contains: search, mode: "insensitive" } } : {}),
      ...(tag ? { tags: { contains: `"${tag}"` } } : {}),
    },
    include: { questionnaire: { select: { title: true, category: true } } },
    orderBy: { id: "desc" },
    take: 100,
  });

  const allTagsRaw = await prisma.question.findMany({ select: { tags: true } });
  const allTags = Array.from(
    new Set(
      allTagsRaw.flatMap((q) => {
        try {
          return JSON.parse(q.tags) as string[];
        } catch {
          return [];
        }
      })
    )
  ).sort();

  return NextResponse.json({
    questions: questions.map((q) => ({
      id: q.id,
      text: q.text,
      choices: JSON.parse(q.choices) as string[],
      correctIndex: q.correctIndex,
      points: q.points,
      timeLimitSec: q.timeLimitSec,
      tags: JSON.parse(q.tags) as string[],
      questionnaireTitle: q.questionnaire.title,
    })),
    allTags,
  });
}
