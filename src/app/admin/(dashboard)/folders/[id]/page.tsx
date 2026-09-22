import { notFound } from "next/navigation";
import { BookOpen, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { InviteToFolderForm } from "@/components/admin/InviteToFolderForm";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";
import { TableCard, Table, Thead, Th, Tr, Td, EmptyRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

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
        {folder.description && <p className="text-sm text-cloudy">{folder.description}</p>}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cloudy">
          Cours inclus ({folder.campaigns.length})
        </h2>
        {folder.campaigns.length > 0 ? (
          <div className="flex flex-col gap-2">
            {folder.campaigns.map((fc) => (
              <div key={fc.campaignId} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-brand">
                  <BookOpen size={14} strokeWidth={2} />
                </span>
                <span>
                  <span className="font-semibold text-ink">{fc.campaign.questionnaire.title}</span>
                  <span className="text-cloudy">
                    {" "}
                    · {fc.campaign.label} · {fc.campaign.company.name}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-ink/10 bg-white">
            <EmptyState icon={BookOpen} title="Aucun cours dans ce dossier" />
          </div>
        )}
      </div>

      <InviteToFolderForm folderId={folder.id} />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cloudy">
          Étudiants invités ({folder.access.length})
        </h2>
        <TableCard>
          <Table>
            <Thead>
              <Th>Étudiant</Th>
              <Th>Email</Th>
              <Th>Invité le</Th>
            </Thead>
            <tbody>
              {folder.access.map((a) => (
                <Tr key={a.id}>
                  <Td className="font-semibold">
                    {a.participant.firstName} {a.participant.lastName}
                  </Td>
                  <Td className="text-cloudy">{a.participant.email}</Td>
                  <Td className="text-cloudy">{a.invitedAt.toLocaleDateString("fr-FR")}</Td>
                </Tr>
              ))}
              {folder.access.length === 0 && (
                <EmptyRow colSpan={3}>
                  <EmptyState icon={Users} title="Aucun étudiant invité pour l'instant" />
                </EmptyRow>
              )}
            </tbody>
          </Table>
        </TableCard>
      </div>
    </div>
  );
}
