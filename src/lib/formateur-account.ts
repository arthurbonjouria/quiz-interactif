import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { formateurInviteEmail } from "@/lib/email/templates";

const generatePassword = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", 10);

/**
 * Crée un compte FORMATEUR et lui envoie ses identifiants par email.
 * Retourne null si un compte existe déjà avec cet email.
 */
export async function createFormateurAccount(name: string, email: string) {
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return null;

  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);

  const formateur = await prisma.adminUser.create({
    data: { name, email, passwordHash, role: "FORMATEUR" },
  });

  sendEmail({
    to: email,
    subject: "Votre accès au back-office — BONJOUR IA",
    html: formateurInviteEmail({ firstName: name.split(" ")[0], email, password }),
  }).catch((err) => console.error("[email] échec envoi invitation formateur", err));

  return formateur;
}
