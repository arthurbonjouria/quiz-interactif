import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";

const generatePinCandidate = customAlphabet("0123456789", 6);

export async function generateUniqueLivePin(): Promise<string> {
  let pin = generatePinCandidate();
  for (let attempts = 0; attempts < 5; attempts++) {
    const existing = await prisma.liveSession.findUnique({ where: { pin } });
    if (!existing) return pin;
    pin = generatePinCandidate();
  }
  return pin;
}
