import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/require-admin";
import { createFormateurAccount } from "@/lib/formateur-account";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  decision: z.enum(["approve", "reject"]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { session, response } = await requireOwner();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const accessRequest = await prisma.accessRequest.findUnique({ where: { id: params.id } });
  if (!accessRequest) return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  if (accessRequest.status !== "PENDING") {
    return NextResponse.json({ error: "Cette demande a déjà été traitée." }, { status: 409 });
  }

  if (parsed.data.decision === "approve") {
    const formateur = await createFormateurAccount(accessRequest.name, accessRequest.email);
    if (!formateur) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }

    await prisma.accessRequest.update({ where: { id: accessRequest.id }, data: { status: "APPROVED", handledAt: new Date() } });

    await logAudit({
      session,
      action: "team.create",
      targetType: "AdminUser",
      targetId: formateur.id,
      targetLabel: `${accessRequest.name} (${accessRequest.email})`,
      metadata: { via: "access-request" },
    });
  } else {
    await prisma.accessRequest.update({ where: { id: accessRequest.id }, data: { status: "REJECTED", handledAt: new Date() } });

    await logAudit({
      session,
      action: "access_request.reject",
      targetType: "AccessRequest",
      targetId: accessRequest.id,
      targetLabel: `${accessRequest.name} (${accessRequest.email})`,
    });
  }

  return NextResponse.json({ ok: true });
}
