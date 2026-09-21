import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { questionSchema, questionCreateData } from "@/lib/question-schema";

const bodySchema = z.object({
  title: z.string().min(1),
  category: z.enum(["POSITIONNEMENT", "IA_ACT", "ACQUIS"]),
  questions: z.array(questionSchema).min(1),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const questionnaire = await prisma.questionnaire.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!questionnaire) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  return NextResponse.json({
    ...questionnaire,
    questions: questionnaire.questions.map((q) => ({
      ...q,
      choices: JSON.parse(q.choices),
      tags: JSON.parse(q.tags),
      correctIndexes: JSON.parse(q.correctIndexes),
    })),
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide", details: parsed.error.flatten() }, { status: 400 });
  }
  const { title, category, questions } = parsed.data;

  await prisma.$transaction([
    prisma.question.deleteMany({ where: { questionnaireId: params.id } }),
    prisma.questionnaire.update({
      where: { id: params.id },
      data: {
        title,
        category,
        questions: {
          create: questions.map((q, i) => questionCreateData(q, i)),
        },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  await prisma.questionnaire.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
