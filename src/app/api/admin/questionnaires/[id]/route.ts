import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const questionSchema = z.object({
  text: z.string().min(1),
  choices: z.array(z.string().min(1)).min(2).max(6),
  correctIndex: z.number().int().min(0),
  points: z.number().int().min(1).default(1000),
  timeLimitSec: z.number().int().min(5).default(20),
  order: z.number().int().default(0),
  tags: z.array(z.string().min(1)).default([]),
});

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
          create: questions.map((q, i) => ({
            text: q.text,
            choices: JSON.stringify(q.choices),
            correctIndex: q.correctIndex,
            points: q.points,
            timeLimitSec: q.timeLimitSec,
            order: q.order ?? i,
            tags: JSON.stringify(q.tags),
          })),
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
