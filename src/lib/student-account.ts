import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";

const generatePassword = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", 10);

/**
 * S'assure que le participant a un compte étudiant (mot de passe défini).
 * Retourne le mot de passe en clair UNIQUEMENT s'il vient d'être créé (pour l'email de bienvenue) —
 * on ne connaît jamais le mot de passe en clair d'un compte déjà existant.
 */
export async function ensureStudentAccount(participantId: string, existingPasswordHash: string | null): Promise<string | null> {
  if (existingPasswordHash) return null;

  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.participant.update({ where: { id: participantId }, data: { passwordHash } });
  return password;
}
