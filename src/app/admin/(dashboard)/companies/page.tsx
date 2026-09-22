import Link from "next/link";
import { Building2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { TableCard, Table, Thead, Th, Tr, Td, EmptyRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { participants: true, campaigns: true } } },
  });

  const business = companies.filter((c) => !c.isPersonal);
  const personal = companies.filter((c) => c.isPersonal);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Entreprises</h1>
        <p className="text-sm text-cloudy">
          Regroupées automatiquement selon le domaine email des participants.
        </p>
      </div>

      <CompanyTable title="Entreprises clientes" companies={business} />
      {personal.length > 0 && (
        <CompanyTable title="Domaines grand public (particuliers)" companies={personal} muted />
      )}
    </div>
  );
}

function CompanyTable({
  title,
  companies,
  muted,
}: {
  title: string;
  companies: Array<{ id: string; name: string; domain: string; _count: { participants: number; campaigns: number } }>;
  muted?: boolean;
}) {
  return (
    <div>
      <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${muted ? "text-cloudy/70" : "text-cloudy"}`}>
        {title}
      </h2>
      <TableCard>
        <Table>
          <Thead>
            <Th>Entreprise</Th>
            <Th>Domaine</Th>
            <Th>Participants</Th>
            <Th>Campagnes</Th>
            <Th />
          </Thead>
          <tbody>
            {companies.map((c) => (
              <Tr key={c.id}>
                <Td className="font-semibold">{c.name}</Td>
                <Td className="text-cloudy">{c.domain}</Td>
                <Td>{c._count.participants}</Td>
                <Td>{c._count.campaigns}</Td>
                <Td className="text-right">
                  <Link href={`/admin/companies/${c.id}`} className="text-sm font-semibold text-brand hover:underline">
                    Ouvrir
                  </Link>
                </Td>
              </Tr>
            ))}
            {companies.length === 0 && (
              <EmptyRow colSpan={5}>
                <EmptyState icon={Building2} title="Aucune entreprise" />
              </EmptyRow>
            )}
          </tbody>
        </Table>
      </TableCard>
    </div>
  );
}
