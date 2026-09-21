import Link from "next/link";
import { prisma } from "@/lib/db";

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
        <p className="text-sm text-neutral-500">
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
      <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${muted ? "text-neutral-400" : "text-neutral-600"}`}>
        {title}
      </h2>
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Domaine</th>
              <th className="px-4 py-3">Participants</th>
              <th className="px-4 py-3">Campagnes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-neutral-500">{c.domain}</td>
                <td className="px-4 py-3">{c._count.participants}</td>
                <td className="px-4 py-3">{c._count.campaigns}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/companies/${c.id}`} className="text-brand hover:underline">
                    Ouvrir
                  </Link>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  Aucune entreprise.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
