import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { findOrCreateCompanyForEmail } from "@/lib/domain";

const bodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: Request, { params }: { params: { pin: string } }) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  const { firstName, lastName, email } = parsed.data;

  const session = await prisma.liveSession.findUnique({ where: { pin: params.pin } });
  if (!session) return NextResponse.json({ error: "Code introuvable" }, { status: 404 });
  if (session.status !== "LOBBY") {
    return NextResponse.json({ error: "Cette partie a déjà démarré." }, { status: 403 });
  }

  const company = await findOrCreateCompanyForEmail(email);

  const participant = await prisma.participant.upsert({
    where: { email },
    update: { firstName, lastName, companyId: company.id },
    create: { firstName, lastName, email, companyId: company.id },
  });

  const existingAttempt = await prisma.attempt.findFirst({
    where: { liveSessionId: session.id, participantId: participant.id },
  });

  const attempt =
    existingAttempt ??
    (await prisma.attempt.create({
      data: { participantId: participant.id, campaignId: session.campaignId, liveSessionId: session.id },
    }));

  return NextResponse.json({ attemptId: attempt.id });
}
