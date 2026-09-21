import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const bodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  campaignIds: z.array(z.string().min(1)).min(1),
});

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const folders = await prisma.folder.findMany({
    orderBy: { createdAt: "desc" },
    include: { campaigns: true, access: true },
  });

  return NextResponse.json(folders);
}

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });

  const { title, description, campaignIds } = parsed.data;

  const folder = await prisma.folder.create({
    data: {
      title,
      description,
      campaigns: { create: campaignIds.map((campaignId) => ({ campaignId })) },
    },
  });

  return NextResponse.json(folder, { status: 201 });
}
