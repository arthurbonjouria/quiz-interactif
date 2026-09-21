import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, isOwner, adminId } from "@/lib/require-admin";

const bodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  campaignIds: z.array(z.string().min(1)).min(1),
});

export async function GET() {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const folders = await prisma.folder.findMany({
    where: isOwner(session) ? {} : { createdById: adminId(session) },
    orderBy: { createdAt: "desc" },
    include: { campaigns: true, access: true },
  });

  return NextResponse.json(folders);
}

export async function POST(req: Request) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });

  const { title, description, campaignIds } = parsed.data;

  if (!isOwner(session)) {
    const owned = await prisma.campaign.count({
      where: { id: { in: campaignIds }, createdById: adminId(session) },
    });
    if (owned !== campaignIds.length) {
      return NextResponse.json({ error: "Vous ne pouvez utiliser que vos propres campagnes." }, { status: 403 });
    }
  }

  const folder = await prisma.folder.create({
    data: {
      title,
      description,
      createdById: adminId(session),
      campaigns: { create: campaignIds.map((campaignId) => ({ campaignId })) },
    },
  });

  return NextResponse.json(folder, { status: 201 });
}
