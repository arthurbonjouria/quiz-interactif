import Link from "next/link";
import { prisma } from "@/lib/db";

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
        <p className="text-sm text-neutral-500">
          Vue consolidée par collaborateur, tous questionnaires confondus.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Recherche</label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Nom ou email"
            className="w-48 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Entreprise</label>
          <select
            name="companyId"
            defaultValue={companyId ?? ""}
            className="w-44 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            <option value="">Toutes</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Catégorie</label>
          <select
            name="category"
            defaultValue={category ?? ""}
            className="w-44 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          >
            <option value="">Toutes</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Du</label>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Au</label>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand">
          Filtrer
        </button>
        <Link href="/admin/participants" className="text-sm text-neutral-500 hover:text-ink">
          Réinitialiser
        </Link>
      </form>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Positionnement</th>
              <th className="px-4 py-3">IA Act</th>
              <th className="px-4 py-3">Acquis</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-xs text-neutral-400">{p.email}</div>
                </td>
                <td className="px-4 py-3">{p.company.name}</td>
                {CATEGORIES.map((c) => (
                  <td key={c.value} className="px-4 py-3">
                    <CategoryCell status={categoryStatus(p.attempts, c.value)} />
                  </td>
                ))}
              </tr>
            ))}
            {participants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  Aucun participant ne correspond à ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryCell({
  status,
}: {
  status: { state: "none" | "in_progress" | "done"; score?: number; attemptId?: string };
}) {
  if (status.state === "none") {
    return <span className="text-xs text-neutral-300">—</span>;
  }
  if (status.state === "in_progress") {
    return (
      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">En cours</span>
    );
  }
  return (
    <Link
      href={`/api/attempts/${status.attemptId}/certificate`}
      className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 hover:underline"
    >
      ✓ {status.score} pts
    </Link>
  );
}
