import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { passwordResetEmail } from "@/lib/email/templates";
import { createPasswordResetToken } from "@/lib/password-reset";

const bodySchema = z.object({
  email: z.string().email(),
  portal: z.enum(["admin", "student"]),
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });

  const { email, portal } = parsed.data;

  // Réponse générique dans tous les cas, pour ne pas révéler si l'email existe.
  const genericResponse = NextResponse.json({
    ok: true,
    message: "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.",
  });

  if (portal === "admin") {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) return genericResponse;

    const token = await createPasswordResetToken("ADMIN", user.id);
    const resetUrl = `${SITE_URL}/admin/reset-password?token=${token}`;
    sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe — BONJOUR IA",
      html: passwordResetEmail({ firstName: user.name.split(" ")[0], resetUrl }),
    }).catch((err) => console.error("[email] échec envoi reset password admin", err));
  } else {
    const participant = await prisma.participant.findUnique({ where: { email } });
    if (!participant || !participant.passwordHash) return genericResponse;

    const token = await createPasswordResetToken("STUDENT", participant.id);
    const resetUrl = `${SITE_URL}/student/reset-password?token=${token}`;
    sendEmail({
      to: participant.email,
      subject: "Réinitialisation de votre mot de passe — BONJOUR IA",
      html: passwordResetEmail({ firstName: participant.firstName, resetUrl }),
    }).catch((err) => console.error("[email] échec envoi reset password étudiant", err));
  }

  return genericResponse;
}
