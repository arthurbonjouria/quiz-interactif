import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  const company = await prisma.company.findUnique({ where: { id: params.id } });
  if (!company) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });

  const attempts = await prisma.attempt.findMany({
    where: { campaign: { companyId: params.id, ...(campaignId ? { id: campaignId } : {}) } },
    include: { participant: true, campaign: { include: { questionnaire: true } }, answers: true },
    orderBy: { startedAt: "asc" },
  });

  const header = [
    "prenom",
    "nom",
    "email",
    "questionnaire",
    "campagne",
    "score",
    "taux_reussite",
    "statut",
    "date_debut",
    "date_fin",
  ];
  const lines = [header.join(",")];

  for (const a of attempts) {
    const answered = a.answers.length;
    const correct = a.answers.filter((ans) => ans.correct).length;
    const successRate = answered > 0 ? `${Math.round((correct / answered) * 100)}%` : "";

    lines.push(
      [
        a.participant.firstName,
        a.participant.lastName,
        a.participant.email,
        a.campaign.questionnaire.title,
        a.campaign.label,
        String(a.totalScore),
        successRate,
        a.finishedAt ? "Terminé" : "En cours",
        a.startedAt.toISOString(),
        a.finishedAt ? a.finishedAt.toISOString() : "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="export-${company.domain}.csv"`,
    },
  });
}
