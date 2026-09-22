import { notFound } from "next/navigation";
import { UserCog } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";
import { NewFormateurForm } from "@/components/admin/NewFormateurForm";
import { RemoveFormateurButton } from "@/components/admin/RemoveFormateurButton";
import { AccessRequestActions } from "@/components/admin/AccessRequestActions";
import { Badge } from "@/components/ui/Badge";
import { TableCard, Table, Thead, Th, Tr, Td, EmptyRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function TeamPage() {
  const session = await auth();
  if (!isOwner(session)) notFound();

  const [team, accessRequests] = await Promise.all([
    prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { campaigns: true, folders: true } } },
    }),
    prisma.accessRequest.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Équipe</h1>
        <p className="text-sm text-cloudy">
          Chaque formateur ne voit que les campagnes et dossiers qu&apos;il crée lui-même. Vous voyez tout.
        </p>
      </div>

      <NewFormateurForm />

      {accessRequests.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-cloudy">
            Demandes d&apos;accès en attente ({accessRequests.length})
          </h2>
          <TableCard>
            <Table>
              <Thead>
                <Th>Nom</Th>
                <Th>Email</Th>
                <Th>Message</Th>
                <Th>Reçue le</Th>
                <Th />
              </Thead>
              <tbody>
                {accessRequests.map((r) => (
                  <Tr key={r.id}>
                    <Td className="font-semibold">{r.name}</Td>
                    <Td className="text-cloudy">{r.email}</Td>
                    <Td className="max-w-xs text-xs text-cloudy">{r.message ?? "—"}</Td>
                    <Td className="text-cloudy">{r.createdAt.toLocaleDateString("fr-FR")}</Td>
                    <Td>
                      <AccessRequestActions id={r.id} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableCard>
        </div>
      )}

      <TableCard>
        <Table>
          <Thead>
            <Th>Nom</Th>
            <Th>Email</Th>
            <Th>Rôle</Th>
            <Th>Campagnes</Th>
            <Th>Dossiers</Th>
            <Th />
          </Thead>
          <tbody>
            {team.map((u) => (
              <Tr key={u.id}>
                <Td className="font-semibold">{u.name}</Td>
                <Td className="text-cloudy">{u.email}</Td>
                <Td>
                  <Badge variant={u.role === "OWNER" ? "brand" : "neutral"}>
                    {u.role === "OWNER" ? "Propriétaire" : "Formateur"}
                  </Badge>
                </Td>
                <Td>{u._count.campaigns}</Td>
                <Td>{u._count.folders}</Td>
                <Td className="text-right">
                  {u.id !== session?.user?.id && <RemoveFormateurButton id={u.id} name={u.name} />}
                </Td>
              </Tr>
            ))}
            {team.length === 0 && (
              <EmptyRow colSpan={6}>
                <EmptyState icon={UserCog} title="Aucun membre d'équipe" />
              </EmptyRow>
            )}
          </tbody>
        </Table>
      </TableCard>
    </div>
  );
}
