import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, isOwner, adminId } from "@/lib/require-admin";
import { generateUniqueLivePin } from "@/lib/live-pin";

const bodySchema = z.object({
  campaignId: z.string().min(1),
});

export async function POST(req: Request) {
  const { session: adminSession, response } = await requireAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const campaign = await prisma.campaign.findUnique({ where: { id: parsed.data.campaignId } });
  if (!campaign) return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
  if (!isOwner(adminSession) && campaign.createdById !== adminId(adminSession)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const pin = await generateUniqueLivePin();

  const liveSession = await prisma.liveSession.create({
    data: { campaignId: parsed.data.campaignId, pin },
  });

  return NextResponse.json(liveSession, { status: 201 });
}
