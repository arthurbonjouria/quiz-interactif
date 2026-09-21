import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { accessRequestNotificationEmail } from "@/lib/email/templates";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });

  const { name, email, message } = parsed.data;

  const existingAccount = await prisma.adminUser.findUnique({ where: { email } });
  if (existingAccount) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email. Connectez-vous directement." }, { status: 409 });
  }

  const existingPending = await prisma.accessRequest.findFirst({ where: { email, status: "PENDING" } });
  if (existingPending) {
    return NextResponse.json({ id: existingPending.id }, { status: 200 });
  }

  const accessRequest = await prisma.accessRequest.create({
    data: { name, email, message },
  });

  const owners = await prisma.adminUser.findMany({ where: { role: "OWNER" }, select: { email: true } });
  for (const owner of owners) {
    sendEmail({
      to: owner.email,
      subject: `Demande d'accès formateur — ${name}`,
      html: accessRequestNotificationEmail({ requesterName: name, requesterEmail: email, message }),
    }).catch((err) => console.error("[email] échec notification demande d'accès", err));
  }

  return NextResponse.json({ id: accessRequest.id }, { status: 201 });
}
