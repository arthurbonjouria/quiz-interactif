import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/require-admin";
import { createFormateurAccount } from "@/lib/formateur-account";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function GET() {
  const { response } = await requireOwner();
  if (response) return response;

  const team = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { campaigns: true, folders: true } },
    },
  });

  return NextResponse.json(team);
}

export async function POST(req: Request) {
  const { session, response } = await requireOwner();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });

  const { name, email } = parsed.data;

  const formateur = await createFormateurAccount(name, email);
  if (!formateur) return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });

  await logAudit({
    session,
    action: "team.create",
    targetType: "AdminUser",
    targetId: formateur.id,
    targetLabel: `${name} (${email})`,
  });

  return NextResponse.json({ id: formateur.id, email: formateur.email }, { status: 201 });
}
