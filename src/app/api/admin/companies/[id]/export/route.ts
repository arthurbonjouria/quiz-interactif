import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { generateRhExportPdf, type RhExportRow } from "@/lib/pdf/rh-export";
import type { CertificateData } from "@/lib/pdf/certificate";
import { computeGradeOutOf10 } from "@/lib/grade";

const CATEGORY_LABELS: Record<string, string> = {
  POSITIONNEMENT: "Positionnement",
  IA_ACT: "IA Act",
  ACQUIS: "Acquis de compétences",
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  const company = await prisma.company.findUnique({ where: { id: params.id } });
  if (!company) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });

  const attempts = await prisma.attempt.findMany({
    where: {
      campaign: { companyId: params.id, ...(campaignId ? { id: campaignId } : {}) },
      finishedAt: { not: null },
    },
    include: {
      participant: true,
      campaign: { include: { questionnaire: { include: { questions: true } } } },
      certificate: true,
      answers: true,
    },
    orderBy: { finishedAt: "asc" },
  });

  const gradeFor = (a: (typeof attempts)[number]) =>
    a.campaign.videoUrl
      ? computeGradeOutOf10(a.answers.filter((ans) => ans.correct).length, a.campaign.questionnaire.questions.length)
      : null;

  const rows: RhExportRow[] = attempts.map((a) => {
    const grade = gradeFor(a);
    return {
      fullName: `${a.participant.firstName} ${a.participant.lastName}`,
      email: a.participant.email,
      score: grade !== null ? grade : a.totalScore,
      date: a.finishedAt ? a.finishedAt.toLocaleDateString("fr-FR") : "-",
      status: "Terminé",
    };
  });

  const certificates: CertificateData[] = attempts.map((a) => ({
    firstName: a.participant.firstName,
    lastName: a.participant.lastName,
    companyName: company.name,
    questionnaireTitle: a.campaign.questionnaire.title,
    category: CATEGORY_LABELS[a.campaign.questionnaire.category] ?? a.campaign.questionnaire.category,
    score: a.totalScore,
    gradeOutOf10: gradeFor(a) ?? undefined,
    date: a.finishedAt ? a.finishedAt.toLocaleDateString("fr-FR") : "-",
  }));

  const campaignLabel = campaignId ? attempts[0]?.campaign.label ?? "Campagne" : "Toutes campagnes";

  const pdf = await generateRhExportPdf({ companyName: company.name, campaignLabel, rows, certificates });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="export-${company.domain}.pdf"`,
    },
  });
}
