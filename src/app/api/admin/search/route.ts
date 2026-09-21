import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, isOwner, adminId } from "@/lib/require-admin";

export async function GET(req: Request) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const owner = isOwner(session);
  const campaignScope = owner ? {} : { createdById: adminId(session) };

  const [participants, campaigns, folders, companies, questionnaires] = await Promise.all([
    prisma.participant.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    prisma.campaign.findMany({
      where: {
        ...campaignScope,
        OR: [
          { label: { contains: q, mode: "insensitive" } },
          { questionnaire: { title: { contains: q, mode: "insensitive" } } },
          { company: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { questionnaire: true, company: true },
      take: 5,
    }),
    prisma.folder.findMany({
      where: { ...campaignScope, title: { contains: q, mode: "insensitive" } },
      take: 5,
    }),
    prisma.company.findMany({
      where: {
        OR: [{ name: { contains: q, mode: "insensitive" } }, { domain: { contains: q, mode: "insensitive" } }],
      },
      take: 5,
    }),
    prisma.questionnaire.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 5,
    }),
  ]);

  const results = [
    ...participants.map((p) => ({
      type: "Participant",
      label: `${p.firstName} ${p.lastName}`,
      sublabel: p.email,
      href: `/admin/participants?q=${encodeURIComponent(p.email)}`,
    })),
    ...campaigns.map((c) => ({
      type: "Campagne",
      label: c.label,
      sublabel: `${c.questionnaire.title} · ${c.company.name}`,
      href: `/admin/campaigns/${c.id}`,
    })),
    ...folders.map((f) => ({
      type: "Dossier",
      label: f.title,
      sublabel: null,
      href: `/admin/folders/${f.id}`,
    })),
    ...companies.map((co) => ({
      type: "Entreprise",
      label: co.name,
      sublabel: co.domain,
      href: `/admin/companies/${co.id}`,
    })),
    ...questionnaires.map((qn) => ({
      type: "Questionnaire",
      label: qn.title,
      sublabel: null,
      href: `/admin/questionnaires/${qn.id}`,
    })),
  ];

  return NextResponse.json({ results });
}
