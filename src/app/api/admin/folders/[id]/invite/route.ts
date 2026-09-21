import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, isOwner, adminId } from "@/lib/require-admin";
import { findOrCreateCompanyForEmail } from "@/lib/domain";
import { ensureStudentAccount } from "@/lib/student-account";
import { sendEmail } from "@/lib/email/client";
import { folderInviteEmail } from "@/lib/email/templates";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  invitees: z
    .array(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
      })
    )
    .min(1),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });

  const folder = await prisma.folder.findUnique({
    where: { id: params.id },
    include: { campaigns: { include: { campaign: { include: { questionnaire: true } } } } },
  });
  if (!folder) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  if (!isOwner(session) && folder.createdById !== adminId(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const courseTitles = folder.campaigns.map((fc) => fc.campaign.questionnaire.title);

  const results = [];

  for (const invitee of parsed.data.invitees) {
    const { firstName, lastName, email } = invitee;

    const company = await findOrCreateCompanyForEmail(email);
    const participant = await prisma.participant.upsert({
      where: { email },
      update: { firstName, lastName },
      create: { firstName, lastName, email, companyId: company.id },
    });

    await prisma.folderAccess.upsert({
      where: { folderId_participantId: { folderId: folder.id, participantId: participant.id } },
      update: {},
      create: { folderId: folder.id, participantId: participant.id },
    });

    for (const fc of folder.campaigns) {
      const existingAttempt = await prisma.attempt.findFirst({
        where: { participantId: participant.id, campaignId: fc.campaignId },
      });
      if (!existingAttempt) {
        await prisma.attempt.create({ data: { participantId: participant.id, campaignId: fc.campaignId } });
      }
    }

    const password = await ensureStudentAccount(participant.id, participant.passwordHash);

    sendEmail({
      to: email,
      subject: `Vos cours "${folder.title}" — BONJOUR IA`,
      html: folderInviteEmail({
        firstName,
        folderTitle: folder.title,
        courseTitles,
        email,
        password: password ?? "(déjà défini — utilisez votre mot de passe existant)",
      }),
    }).catch((err) => console.error("[email] échec envoi invitation dossier", err));

    results.push({ email, created: !!password });
  }

  await logAudit({
    session,
    action: "folder.invite",
    targetType: "Folder",
    targetId: folder.id,
    targetLabel: folder.title,
    metadata: { invited: results.map((r) => r.email) },
  });

  return NextResponse.json({ invited: results.length, results });
}
