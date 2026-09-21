import crypto from "crypto";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";

const generateToken = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", 40);
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export type ResetUserType = "ADMIN" | "STUDENT";

export async function createPasswordResetToken(userType: ResetUserType, userId: string): Promise<string> {
  const token = generateToken();
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashToken(token),
      userType,
      userId,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return token;
}

export async function consumePasswordResetToken(
  userType: ResetUserType,
  token: string
): Promise<{ userId: string } | null> {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.userType !== userType || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return { userId: record.userId };
}
