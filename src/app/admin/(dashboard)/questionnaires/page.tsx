import Link from "next/link";
import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/db";
import { LinkButton } from "@/components/ui/Button";
import { TableCard, Table, Thead, Th, Tr, Td, EmptyRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

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
          <p className="text-sm text-cloudy">Vos banques de questions, réutilisables pour plusieurs campagnes.</p>
        </div>
        <LinkButton href="/admin/questionnaires/new">+ Nouveau questionnaire</LinkButton>
      </div>

      <TableCard>
        <Table>
          <Thead>
            <Th>Titre</Th>
            <Th>Catégorie</Th>
            <Th>Questions</Th>
            <Th>Campagnes</Th>
            <Th />
          </Thead>
          <tbody>
            {questionnaires.map((q) => (
              <Tr key={q.id}>
                <Td className="font-semibold">{q.title}</Td>
                <Td>{CATEGORY_LABELS[q.category] ?? q.category}</Td>
                <Td>{q._count.questions}</Td>
                <Td>{q._count.campaigns}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/campaigns/new?questionnaireId=${q.id}`} className="text-sm text-cloudy hover:text-ink">
                      + Campagne
                    </Link>
                    <Link href={`/admin/questionnaires/${q.id}`} className="text-sm font-semibold text-brand hover:underline">
                      Ouvrir
                    </Link>
                  </div>
                </Td>
              </Tr>
            ))}
            {questionnaires.length === 0 && (
              <EmptyRow colSpan={5}>
                <EmptyState icon={BookOpen} title="Aucun questionnaire pour l'instant" />
              </EmptyRow>
            )}
          </tbody>
        </Table>
      </TableCard>
    </div>
  );
}
