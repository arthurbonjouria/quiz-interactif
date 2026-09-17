import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { generateUniqueLivePin } from "@/lib/live-pin";

const bodySchema = z.object({
  campaignId: z.string().min(1),
});

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const pin = await generateUniqueLivePin();

  const session = await prisma.liveSession.create({
    data: { campaignId: parsed.data.campaignId, pin },
  });

  return NextResponse.json(session, { status: 201 });
}
