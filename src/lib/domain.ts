import { prisma } from "@/lib/db";

// Domaines de messagerie grand public : les participants qui s'inscrivent avec
// ces domaines sont regroupés dans des "entreprises" marquées isPersonal,
// plutôt que traités comme une vraie entreprise cliente.
const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "outlook.fr",
  "hotmail.com",
  "hotmail.fr",
  "live.com",
  "live.fr",
  "yahoo.com",
  "yahoo.fr",
  "icloud.com",
  "me.com",
  "aol.com",
  "gmx.com",
  "gmx.fr",
  "protonmail.com",
  "proton.me",
  "free.fr",
  "orange.fr",
  "wanadoo.fr",
  "laposte.net",
  "sfr.fr",
  "bbox.fr",
  "numericable.fr",
]);

export function extractDomain(email: string): string {
  const at = email.lastIndexOf("@");
  if (at === -1) throw new Error("Email invalide");
  return email.slice(at + 1).trim().toLowerCase();
}

export function isPersonalDomain(domain: string): boolean {
  return PERSONAL_EMAIL_DOMAINS.has(domain.toLowerCase());
}

function domainToCompanyName(domain: string): string {
  const base = domain.split(".")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export async function findOrCreateCompanyForEmail(email: string) {
  return findOrCreateCompanyByDomain(extractDomain(email));
}

export async function findOrCreateCompanyByDomain(domain: string, name?: string) {
  const normalizedDomain = domain.trim().toLowerCase();
  const existing = await prisma.company.findUnique({ where: { domain: normalizedDomain } });
  if (existing) return existing;

  return prisma.company.create({
    data: {
      domain: normalizedDomain,
      name: name?.trim() || domainToCompanyName(normalizedDomain),
      isPersonal: isPersonalDomain(normalizedDomain),
    },
  });
}
