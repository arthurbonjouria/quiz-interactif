import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { consumePasswordResetToken } from "@/lib/password-reset";
import { logAudit } from "@/lib/audit";

const bodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  portal: z.enum(["admin", "student"]),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Formulaire invalide" }, { status: 400 });
  }

  const { token, password, portal } = parsed.data;
  const userType = portal === "admin" ? "ADMIN" : "STUDENT";

  const consumed = await consumePasswordResetToken(userType, token);
  if (!consumed) {
    return NextResponse.json({ error: "Ce lien de réinitialisation est invalide ou a expiré." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  if (portal === "admin") {
    const user = await prisma.adminUser.update({ where: { id: consumed.userId }, data: { passwordHash } });
    await logAudit({
      action: "password.reset",
      targetType: "AdminUser",
      targetId: user.id,
      targetLabel: `${user.name} (${user.email})`,
    });
  } else {
    await prisma.participant.update({ where: { id: consumed.userId }, data: { passwordHash } });
  }

  return NextResponse.json({ ok: true });
}
