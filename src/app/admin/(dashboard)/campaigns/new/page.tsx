import { prisma } from "@/lib/db";
import { NewCampaignForm } from "@/components/admin/NewCampaignForm";

export default async function NewCampaignPage() {
  const questionnaires = await prisma.questionnaire.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Nouvelle campagne</h1>
      <NewCampaignForm questionnaires={questionnaires.map((q) => ({ id: q.id, title: q.title, category: q.category }))} />
    </div>
  );
}
