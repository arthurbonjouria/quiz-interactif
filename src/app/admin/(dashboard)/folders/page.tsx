import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";
import { LinkButton } from "@/components/ui/Button";
import { TableCard, Table, Thead, Th, Tr, Td, EmptyRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function FoldersPage() {
  const session = await auth();
  const owner = isOwner(session);

  const folders = await prisma.folder.findMany({
    where: owner ? {} : { createdById: session?.user?.id },
    orderBy: { createdAt: "desc" },
    include: { campaigns: true, access: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dossiers de cours</h1>
          <p className="text-sm text-cloudy">
            Regroupez plusieurs campagnes et envoyez les accès par email à vos étudiants en une fois.
          </p>
        </div>
        <LinkButton href="/admin/folders/new">+ Nouveau dossier</LinkButton>
      </div>

      <TableCard>
        <Table>
          <Thead>
            <Th>Dossier</Th>
            <Th>Cours</Th>
            <Th>Étudiants invités</Th>
            <Th />
          </Thead>
          <tbody>
            {folders.map((f) => (
              <Tr key={f.id}>
                <Td className="font-semibold">{f.title}</Td>
                <Td>{f.campaigns.length}</Td>
                <Td>{f.access.length}</Td>
                <Td className="text-right">
                  <Link href={`/admin/folders/${f.id}`} className="text-sm font-semibold text-brand hover:underline">
                    Ouvrir
                  </Link>
                </Td>
              </Tr>
            ))}
            {folders.length === 0 && (
              <EmptyRow colSpan={4}>
                <EmptyState icon={FolderOpen} title="Aucun dossier pour l'instant" />
              </EmptyRow>
            )}
          </tbody>
        </Table>
      </TableCard>
    </div>
  );
}
