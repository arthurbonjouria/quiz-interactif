import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const folder = await prisma.folder.findUnique({
    where: { id: params.id },
    include: {
      campaigns: { include: { campaign: { include: { questionnaire: true, company: true } } } },
      access: { include: { participant: true } },
    },
  });
  if (!folder) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });

  return NextResponse.json(folder);
}
