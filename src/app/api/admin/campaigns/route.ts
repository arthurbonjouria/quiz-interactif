import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { findOrCreateCompanyByDomain } from "@/lib/domain";

const generateCode = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 7);

const bodySchema = z.object({
  questionnaireId: z.string().min(1),
  label: z.string().min(1),
  companyDomain: z.string().min(1),
  companyName: z.string().optional(),
  endsAt: z.string().optional(),
});

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      questionnaire: true,
      company: true,
      _count: { select: { attempts: true } },
    },
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide" }, { status: 400 });
  }
  const { questionnaireId, label, companyDomain, companyName, endsAt } = parsed.data;

  const company = await findOrCreateCompanyByDomain(companyDomain, companyName);

  let code = generateCode();
  for (let attempts = 0; attempts < 5; attempts++) {
    const existing = await prisma.campaign.findUnique({ where: { code } });
    if (!existing) break;
    code = generateCode();
  }

  const parsedEndsAt = endsAt ? new Date(endsAt) : null;

  const campaign = await prisma.campaign.create({
    data: {
      questionnaireId,
      companyId: company.id,
      label,
      code,
      ...(parsedEndsAt && !isNaN(parsedEndsAt.getTime()) ? { endsAt: parsedEndsAt } : {}),
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
