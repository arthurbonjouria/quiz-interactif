import { prisma } from "@/lib/db";
import { generateCertificatePdf } from "@/lib/pdf/certificate";
import { sendEmail } from "@/lib/email/client";
import { certificateEmail } from "@/lib/email/templates";

const CATEGORY_LABELS: Record<string, string> = {
  POSITIONNEMENT: "Positionnement",
  IA_ACT: "IA Act",
  ACQUIS: "Acquis de compétences",
};

export async function finishAttempt(attemptId: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      participant: { include: { company: true } },
      campaign: { include: { questionnaire: true } },
      answers: true,
      certificate: true,
    },
  });

  if (!attempt) throw new Error("Tentative introuvable");

  const totalScore = attempt.answers.reduce((sum, a) => sum + a.pointsEarned, 0);

  if (!attempt.finishedAt) {
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: { finishedAt: new Date(), totalScore },
    });
  }

  const companyAttempts = await prisma.attempt.findMany({
    where: { campaignId: attempt.campaignId, finishedAt: { not: null } },
    select: { totalScore: true },
  });
  const companyAverage =
    companyAttempts.length > 0
      ? Math.round(companyAttempts.reduce((s, a) => s + a.totalScore, 0) / companyAttempts.length)
      : totalScore;

  let certificateId = attempt.certificate?.id ?? null;

  if (!attempt.certificate) {
    const date = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
    const pdfBuffer = await generateCertificatePdf({
      firstName: attempt.participant.firstName,
      lastName: attempt.participant.lastName,
      companyName: attempt.participant.company.name,
      questionnaireTitle: attempt.campaign.questionnaire.title,
      category: CATEGORY_LABELS[attempt.campaign.questionnaire.category] ?? attempt.campaign.questionnaire.category,
      score: totalScore,
      date,
    });

    const certificate = await prisma.certificate.create({
      data: { attemptId: attempt.id, pdfData: pdfBuffer },
    });
    certificateId = certificate.id;

    sendEmail({
      to: attempt.participant.email,
      subject: "Votre certificat BONJOUR IA",
      html: certificateEmail({
        firstName: attempt.participant.firstName,
        questionnaireTitle: attempt.campaign.questionnaire.title,
        score: totalScore,
      }),
      attachments: [{ filename: `certificat-${attempt.participant.lastName}.pdf`, content: pdfBuffer }],
    })
      .then(async (result) => {
        if (result.sent) {
          await prisma.certificate.update({
            where: { id: certificate.id },
            data: { emailedAt: new Date() },
          });
        }
      })
      .catch((err) => console.error("[email] échec envoi certificat", err));
  }

  return { totalScore, companyAverage, certificateId };
}
