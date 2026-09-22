import { prisma } from "@/lib/db";
import { NewCampaignForm } from "@/components/admin/NewCampaignForm";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: { questionnaireId?: string };
}) {
  const questionnaires = await prisma.questionnaire.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Nouvelle campagne</h1>
        <p className="text-sm text-cloudy">
          Associe un questionnaire à une entreprise et génère un lien unique à partager.
        </p>
      </div>
      <NewCampaignForm
        questionnaires={questionnaires.map((q) => ({ id: q.id, title: q.title, category: q.category }))}
        defaultQuestionnaireId={searchParams.questionnaireId}
      />
    </div>
  );
}
