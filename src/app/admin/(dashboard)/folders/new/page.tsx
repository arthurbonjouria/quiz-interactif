import { prisma } from "@/lib/db";
import { NewFolderForm } from "@/components/admin/NewFolderForm";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";

export default async function NewFolderPage() {
  const session = await auth();
  const campaigns = await prisma.campaign.findMany({
    where: isOwner(session) ? {} : { createdById: session?.user?.id },
    orderBy: { createdAt: "desc" },
    include: { questionnaire: true, company: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Nouveau dossier</h1>
      <NewFolderForm
        campaigns={campaigns.map((c) => ({
          id: c.id,
          label: c.label,
          questionnaireTitle: c.questionnaire.title,
          companyName: c.company.name,
        }))}
      />
    </div>
  );
}
