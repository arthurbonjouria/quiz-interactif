import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, isOwner, adminId } from "@/lib/require-admin";

const bodySchema = z.object({
  label: z.string().min(1).optional(),
  endsAt: z.string().nullable().optional(),
  active: z.boolean().optional(),
  videoUrl: z.string().nullable().optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { questionnaire: true, company: true },
  });
  if (!campaign) return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
  if (!isOwner(session) && campaign.createdById !== adminId(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  return NextResponse.json(campaign);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const existing = await prisma.campaign.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
  if (!isOwner(session) && existing.createdById !== adminId(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  }
  const { label, endsAt, active, videoUrl } = parsed.data;

  let parsedEndsAt: Date | null | undefined = undefined;
  if (endsAt !== undefined) {
    if (endsAt === null || endsAt === "") {
      parsedEndsAt = null;
    } else {
      const d = new Date(endsAt);
      parsedEndsAt = isNaN(d.getTime()) ? undefined : d;
    }
  }

  const campaign = await prisma.campaign.update({
    where: { id: params.id },
    data: {
      ...(label !== undefined ? { label } : {}),
      ...(parsedEndsAt !== undefined ? { endsAt: parsedEndsAt } : {}),
      ...(active !== undefined ? { active } : {}),
      ...(videoUrl !== undefined ? { videoUrl } : {}),
    },
  });

  return NextResponse.json(campaign);
}
