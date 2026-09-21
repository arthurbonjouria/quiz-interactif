import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { reminderEmail } from "@/lib/email/templates";
import { getCampaignStatus } from "@/lib/campaign-status";

export const dynamic = "force-dynamic";

const DELAY_DAYS = Number(process.env.REMINDER_DELAY_DAYS ?? 3);
const COOLDOWN_DAYS = Number(process.env.REMINDER_COOLDOWN_DAYS ?? 4);

export async function GET(req: Request) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  const now = Date.now();
  const delayCutoff = new Date(now - DELAY_DAYS * 24 * 60 * 60 * 1000);
  const cooldownCutoff = new Date(now - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

  const candidates = await prisma.attempt.findMany({
    where: {
      finishedAt: null,
      startedAt: { lte: delayCutoff },
      OR: [{ lastReminderAt: null }, { lastReminderAt: { lte: cooldownCutoff } }],
    },
    include: {
      participant: true,
      campaign: { include: { questionnaire: true } },
    },
  });

  let sent = 0;
  for (const attempt of candidates) {
    if (getCampaignStatus(attempt.campaign) !== "active") continue;

    await sendEmail({
      to: attempt.participant.email,
      subject: `On vous attend pour "${attempt.campaign.questionnaire.title}" — BONJOUR IA`,
      html: reminderEmail({
        firstName: attempt.participant.firstName,
        questionnaireTitle: attempt.campaign.questionnaire.title,
        campaignCode: attempt.campaign.code,
      }),
    }).catch((err) => console.error("[email] échec envoi relance", err));

    await prisma.attempt.update({ where: { id: attempt.id }, data: { lastReminderAt: new Date() } });
    sent += 1;
  }

  return NextResponse.json({ checked: candidates.length, sent });
}
