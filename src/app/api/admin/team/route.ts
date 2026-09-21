import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/require-admin";
import { sendEmail } from "@/lib/email/client";
import { formateurInviteEmail } from "@/lib/email/templates";

const generatePassword = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789", 10);

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
  const { response } = await requireOwner();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });

  const { name, email } = parsed.data;

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });

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

  return NextResponse.json({ id: formateur.id, email: formateur.email }, { status: 201 });
}
