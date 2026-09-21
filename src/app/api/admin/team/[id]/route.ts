import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner, adminId } from "@/lib/require-admin";
import { logAudit } from "@/lib/audit";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { session, response } = await requireOwner();
  if (response) return response;

  if (params.id === adminId(session)) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  }

  const target = await prisma.adminUser.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.adminUser.delete({ where: { id: params.id } });

  await logAudit({
    session,
    action: "team.delete",
    targetType: "AdminUser",
    targetId: target.id,
    targetLabel: `${target.name} (${target.email})`,
  });

  return NextResponse.json({ ok: true });
}
