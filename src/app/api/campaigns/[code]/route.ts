import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { code: params.code },
    include: {
      questionnaire: {
        include: { questions: { orderBy: { order: "asc" } } },
      },
      company: true,
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    id: campaign.id,
    code: campaign.code,
    label: campaign.label,
    company: { name: campaign.company.name },
    questionnaire: {
      id: campaign.questionnaire.id,
      title: campaign.questionnaire.title,
      category: campaign.questionnaire.category,
    },
    questions: campaign.questionnaire.questions.map((q) => ({
      id: q.id,
      text: q.text,
      choices: JSON.parse(q.choices) as string[],
      points: q.points,
      timeLimitSec: q.timeLimitSec,
      order: q.order,
    })),
  });
}
