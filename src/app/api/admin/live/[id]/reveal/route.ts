import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireLiveSessionAccess } from "@/lib/require-admin";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { response } = await requireLiveSessionAccess(params.id);
  if (response) return response;

  const session = await prisma.liveSession.findUnique({ where: { id: params.id } });
  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  if (session.status !== "QUESTION") {
    return NextResponse.json({ error: "Aucune question en cours." }, { status: 409 });
  }

  const updated = await prisma.liveSession.update({
    where: { id: params.id },
    data: { status: "REVEAL" },
  });

  return NextResponse.json(updated);
}
