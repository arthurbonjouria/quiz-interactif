import Link from "next/link";
import { Check, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TableCard, Table, Thead, Th, Tr, Td, EmptyRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

const CATEGORIES = [
  { value: "POSITIONNEMENT", label: "Positionnement" },
  { value: "IA_ACT", label: "IA Act" },
  { value: "ACQUIS", label: "Acquis de compétences" },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]["value"];

type SearchParams = {
  q?: string;
  companyId?: string;
  category?: string;
  from?: string;
  to?: string;
};

function categoryStatus(
  attempts: Array<{
    id: string;
    finishedAt: Date | null;
    totalScore: number;
    startedAt: Date;
    campaign: { questionnaire: { category: string } };
  }>,
  category: CategoryValue
) {
  const relevant = attempts
    .filter((a) => a.campaign.questionnaire.category === category)
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

  if (relevant.length === 0) return { state: "none" as const };

  const finished = relevant.find((a) => a.finishedAt);
  if (finished) return { state: "done" as const, score: finished.totalScore, attemptId: finished.id };

  return { state: "in_progress" as const };
}

export default async function ParticipantsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, companyId, category, from, to } = searchParams;

  const companies = await prisma.company.findMany({ orderBy: { name: "asc" } });

  const dateFilter =
    from || to
      ? {
          startedAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
          },
        }
      : undefined;

  const participants = await prisma.participant.findMany({
    where: {
      ...(companyId ? { companyId } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
      ...(category || dateFilter
        ? {
            attempts: {
              some: {
                ...(category ? { campaign: { questionnaire: { category } } } : {}),
                ...(dateFilter ?? {}),
              },
            },
          }
        : {}),
    },
    include: {
      company: true,
      attempts: {
        include: { campaign: { include: { questionnaire: true } } },
        orderBy: { startedAt: "desc" },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 300,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Participants</h1>
        <p className="text-sm text-cloudy">Vue consolidée par collaborateur, tous questionnaires confondus.</p>
      </div>

      <Card>
        <form method="get" className="flex flex-wrap items-end gap-3">
          <Field label="Recherche">
            <Input type="text" name="q" defaultValue={q} placeholder="Nom ou email" className="w-48" />
          </Field>
          <Field label="Entreprise">
            <Select name="companyId" defaultValue={companyId ?? ""} className="w-44">
              <option value="">Toutes</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Catégorie">
            <Select name="category" defaultValue={category ?? ""} className="w-44">
              <option value="">Toutes</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Du">
            <Input type="date" name="from" defaultValue={from} />
          </Field>
          <Field label="Au">
            <Input type="date" name="to" defaultValue={to} />
          </Field>
          <Button type="submit">Filtrer</Button>
          <Link href="/admin/participants" className="pb-2.5 text-sm font-medium text-cloudy hover:text-ink">
            Réinitialiser
          </Link>
        </form>
      </Card>

      <TableCard>
        <Table>
          <Thead>
            <Th>Participant</Th>
            <Th>Entreprise</Th>
            <Th>Positionnement</Th>
            <Th>IA Act</Th>
            <Th>Acquis</Th>
          </Thead>
          <tbody>
            {participants.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <div className="font-semibold">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-xs text-cloudy">{p.email}</div>
                </Td>
                <Td>{p.company.name}</Td>
                {CATEGORIES.map((c) => (
                  <Td key={c.value}>
                    <CategoryCell status={categoryStatus(p.attempts, c.value)} />
                  </Td>
                ))}
              </Tr>
            ))}
            {participants.length === 0 && (
              <EmptyRow colSpan={5}>
                <EmptyState icon={Users} title="Aucun participant ne correspond à ces filtres" />
              </EmptyRow>
            )}
          </tbody>
        </Table>
      </TableCard>
    </div>
  );
}

function CategoryCell({
  status,
}: {
  status: { state: "none" | "in_progress" | "done"; score?: number; attemptId?: string };
}) {
  if (status.state === "none") {
    return <span className="text-xs text-cloudy/60">—</span>;
  }
  if (status.state === "in_progress") {
    return <Badge variant="warning">En cours</Badge>;
  }
  return (
    <Link href={`/api/attempts/${status.attemptId}/certificate`} className="inline-flex">
      <Badge variant="brand" className="hover:underline">
        <Check size={12} strokeWidth={3} /> {status.score} pts
      </Badge>
    </Link>
  );
}
