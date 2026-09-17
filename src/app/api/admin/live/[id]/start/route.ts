import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const session = await prisma.liveSession.findUnique({
    where: { id: params.id },
    include: { _count: { select: { attempts: true } } },
  });
  if (!session) return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  if (session.status !== "LOBBY") {
    return NextResponse.json({ error: "La session a déjà démarré." }, { status: 409 });
  }
  if (session._count.attempts === 0) {
    return NextResponse.json({ error: "Aucun joueur n'a encore rejoint." }, { status: 400 });
  }

  const updated = await prisma.liveSession.update({
    where: { id: params.id },
    data: { status: "QUESTION", currentIndex: 0, questionStartedAt: new Date() },
  });

  return NextResponse.json(updated);
}
