import Link from "next/link";
import { prisma } from "@/lib/db";

const CATEGORY_LABELS: Record<string, string> = {
  POSITIONNEMENT: "Positionnement",
  IA_ACT: "IA Act",
  ACQUIS: "Acquis de compétences",
};

export default async function QuestionnairesPage() {
  const questionnaires = await prisma.questionnaire.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true, campaigns: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Questionnaires</h1>
          <p className="text-sm text-neutral-500">Vos banques de questions, réutilisables pour plusieurs campagnes.</p>
        </div>
        <Link href="/admin/questionnaires/new" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand">
          + Nouveau questionnaire
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Questions</th>
              <th className="px-4 py-3">Campagnes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {questionnaires.map((q) => (
              <tr key={q.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">{q.title}</td>
                <td className="px-4 py-3">{CATEGORY_LABELS[q.category] ?? q.category}</td>
                <td className="px-4 py-3">{q._count.questions}</td>
                <td className="px-4 py-3">{q._count.campaigns}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/campaigns/new?questionnaireId=${q.id}`}
                      className="text-neutral-500 hover:text-ink"
                    >
                      + Campagne
                    </Link>
                    <Link href={`/admin/questionnaires/${q.id}`} className="text-brand hover:underline">
                      Ouvrir
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {questionnaires.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  Aucun questionnaire pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
