import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().min(1).optional(),
  mergeIntoId: z.string().min(1).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  const { name, domain, mergeIntoId } = parsed.data;

  if (mergeIntoId) {
    if (mergeIntoId === params.id) {
      return NextResponse.json({ error: "Impossible de fusionner une entreprise avec elle-même." }, { status: 400 });
    }
    await prisma.$transaction([
      prisma.participant.updateMany({ where: { companyId: params.id }, data: { companyId: mergeIntoId } }),
      prisma.campaign.updateMany({ where: { companyId: params.id }, data: { companyId: mergeIntoId } }),
      prisma.company.delete({ where: { id: params.id } }),
    ]);
    return NextResponse.json({ ok: true, mergedInto: mergeIntoId });
  }

  const company = await prisma.company.update({
    where: { id: params.id },
    data: { ...(name ? { name } : {}), ...(domain ? { domain: domain.trim().toLowerCase() } : {}) },
  });

  return NextResponse.json(company);
}
