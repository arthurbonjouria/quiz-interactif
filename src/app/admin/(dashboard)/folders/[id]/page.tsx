import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { InviteToFolderForm } from "@/components/admin/InviteToFolderForm";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";

export default async function FolderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const folder = await prisma.folder.findUnique({
    where: { id: params.id },
    include: {
      campaigns: { include: { campaign: { include: { questionnaire: true, company: true } } } },
      access: { include: { participant: true } },
    },
  });

  if (!folder) notFound();
  if (!isOwner(session) && folder.createdById !== session?.user?.id) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">{folder.title}</h1>
        {folder.description && <p className="text-sm text-neutral-500">{folder.description}</p>}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Cours inclus ({folder.campaigns.length})
        </h2>
        <div className="flex flex-col gap-2">
          {folder.campaigns.map((fc) => (
            <div key={fc.campaignId} className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm">
              <span className="font-medium">{fc.campaign.questionnaire.title}</span>
              <span className="text-neutral-400"> · {fc.campaign.label} · {fc.campaign.company.name}</span>
            </div>
          ))}
        </div>
      </div>

      <InviteToFolderForm folderId={folder.id} />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Étudiants invités ({folder.access.length})
        </h2>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Étudiant</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Invité le</th>
              </tr>
            </thead>
            <tbody>
              {folder.access.map((a) => (
                <tr key={a.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium">
                    {a.participant.firstName} {a.participant.lastName}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{a.participant.email}</td>
                  <td className="px-4 py-3 text-neutral-500">{a.invitedAt.toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
              {folder.access.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral-400">
                    Aucun étudiant invité pour l&apos;instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
