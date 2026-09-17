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
});

const bodySchema = z.object({
  title: z.string().min(1),
  category: z.enum(["POSITIONNEMENT", "IA_ACT", "ACQUIS"]),
  questions: z.array(questionSchema).min(1),
});

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const questionnaires = await prisma.questionnaire.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true, campaigns: true } } },
  });

  return NextResponse.json(questionnaires);
}

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide", details: parsed.error.flatten() }, { status: 400 });
  }
  const { title, category, questions } = parsed.data;

  const questionnaire = await prisma.questionnaire.create({
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
        })),
      },
    },
  });

  return NextResponse.json(questionnaire, { status: 201 });
}
