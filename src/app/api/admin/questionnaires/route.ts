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
        create: questions.map((q, i) => questionCreateData(q, i)),
      },
    },
  });

  return NextResponse.json(questionnaire, { status: 201 });
}
