import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { findOrCreateCompanyForEmail } from "@/lib/domain";
import { sendEmail } from "@/lib/email/client";
import { registrationConfirmationEmail } from "@/lib/email/templates";
import { getCampaignStatus } from "@/lib/campaign-status";
import { ensureStudentAccount } from "@/lib/student-account";

const bodySchema = z.object({
  code: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  }
  const { code, firstName, lastName, email } = parsed.data;

  const campaign = await prisma.campaign.findUnique({
    where: { code },
    include: { questionnaire: true },
  });
  if (!campaign) {
    return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
  }

  const company = await findOrCreateCompanyForEmail(email);

  const participant = await prisma.participant.upsert({
    where: { email },
    update: { firstName, lastName, companyId: company.id },
    create: { firstName, lastName, email, companyId: company.id },
  });

  const existingAttempt = await prisma.attempt.findFirst({
    where: { participantId: participant.id, campaignId: campaign.id },
  });

  if (!existingAttempt && getCampaignStatus(campaign) !== "active") {
    return NextResponse.json({ error: "Cette campagne n'accepte plus de nouvelles inscriptions." }, { status: 403 });
  }

  const attempt =
    existingAttempt ??
    (await prisma.attempt.create({
      data: { participantId: participant.id, campaignId: campaign.id },
    }));

  const newPassword = await ensureStudentAccount(participant.id, participant.passwordHash);

  sendEmail({
    to: email,
    subject: "Confirmation de votre inscription — BONJOUR IA",
    html: registrationConfirmationEmail({
      firstName,
      questionnaireTitle: campaign.questionnaire.title,
      studentEmail: email,
      studentPassword: newPassword ?? undefined,
    }),
  }).catch((err) => console.error("[email] échec envoi confirmation", err));

  return NextResponse.json({
    attemptId: attempt.id,
    alreadyFinished: Boolean(attempt.finishedAt),
    hasVideo: Boolean(campaign.videoUrl),
  });
}
