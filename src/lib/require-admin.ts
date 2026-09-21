import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, response: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }
  return { session, response: null };
}

export function isOwner(session: unknown): boolean {
  return (session as { user?: { adminRole?: string } } | null)?.user?.adminRole === "OWNER";
}

export function adminId(session: unknown): string {
  return (session as { user?: { id?: string } } | null)?.user?.id as string;
}

export async function requireLiveSessionAccess(liveSessionId: string) {
  const { session, response } = await requireAdmin();
  if (response) return { session: null, liveSession: null, response };

  const liveSession = await prisma.liveSession.findUnique({
    where: { id: liveSessionId },
    include: { campaign: { select: { createdById: true } } },
  });
  if (!liveSession) {
    return { session: null, liveSession: null, response: NextResponse.json({ error: "Session introuvable" }, { status: 404 }) };
  }
  if (!isOwner(session) && liveSession.campaign.createdById !== adminId(session)) {
    return { session: null, liveSession: null, response: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }
  return { session, liveSession, response: null };
}

export async function requireOwner() {
  const { session, response } = await requireAdmin();
  if (response) return { session: null, response };
  if (!isOwner(session)) {
    return { session: null, response: NextResponse.json({ error: "Réservé au propriétaire du compte" }, { status: 403 }) };
  }
  return { session, response: null };
}
