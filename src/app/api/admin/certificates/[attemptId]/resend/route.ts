import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { sendEmail } from "@/lib/email/client";
import { certificateEmail } from "@/lib/email/templates";

export async function POST(_req: Request, { params }: { params: { attemptId: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const attempt = await prisma.attempt.findUnique({
    where: { id: params.attemptId },
    include: { participant: true, campaign: { include: { questionnaire: true } }, certificate: true },
  });

  if (!attempt || !attempt.certificate) {
    return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });
  }

  const pdfBuffer = Buffer.from(attempt.certificate.pdfData);

  const result = await sendEmail({
    to: attempt.participant.email,
    subject: "Votre certificat BONJOUR IA",
    html: certificateEmail({
      firstName: attempt.participant.firstName,
      questionnaireTitle: attempt.campaign.questionnaire.title,
      score: attempt.totalScore,
    }),
    attachments: [{ filename: `certificat-${attempt.participant.lastName}.pdf`, content: pdfBuffer }],
  });

  if (result.sent) {
    await prisma.certificate.update({ where: { id: attempt.certificate.id }, data: { emailedAt: new Date() } });
  }

  return NextResponse.json({ sent: result.sent });
}
