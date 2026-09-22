import { notFound } from "next/navigation";
import { History } from "lucide-react";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { TableCard, Table, Thead, Th, Tr, Td, EmptyRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

const ACTION_LABELS: Record<string, string> = {
  "campaign.create": "Campagne créée",
  "campaign.update": "Campagne modifiée",
  "folder.create": "Dossier créé",
  "folder.invite": "Étudiants invités",
  "certificate.resend": "Certificat renvoyé",
  "team.create": "Formateur ajouté",
  "team.delete": "Formateur supprimé",
  "access_request.reject": "Demande d'accès refusée",
  "password.reset": "Mot de passe réinitialisé",
  "reminder.sent": "Relances automatiques",
};

export default async function AuditPage() {
  const session = await auth();
  if (!isOwner(session)) notFound();

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Historique</h1>
          <p className="text-sm text-cloudy">
            Journal des actions effectuées sur la plateforme, pour votre suivi qualité (Qualiopi).
          </p>
        </div>
        <LinkButton href="/api/admin/audit/export" className="shrink-0">
          Export PDF
        </LinkButton>
      </div>

      <TableCard>
        <Table>
          <Thead>
            <Th>Date</Th>
            <Th>Qui</Th>
            <Th>Action</Th>
            <Th>Concerne</Th>
            <Th>Détails</Th>
          </Thead>
          <tbody>
            {entries.map((e) => {
              const metadata = e.metadata ? (JSON.parse(e.metadata) as Record<string, unknown>) : null;
              return (
                <Tr key={e.id} className="align-top">
                  <Td className="whitespace-nowrap text-cloudy">
                    {e.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </Td>
                  <Td>{e.actorName}</Td>
                  <Td>
                    <Badge variant="brand">{ACTION_LABELS[e.action] ?? e.action}</Badge>
                  </Td>
                  <Td>{e.targetLabel}</Td>
                  <Td className="max-w-xs">
                    {metadata && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(metadata).map(([key, val]) => (
                          <span
                            key={key}
                            className="rounded-full bg-offwhite px-2 py-0.5 text-[11px] font-medium text-cloudy"
                          >
                            {key} : {String(val)}
                          </span>
                        ))}
                      </div>
                    )}
                  </Td>
                </Tr>
              );
            })}
            {entries.length === 0 && (
              <EmptyRow colSpan={5}>
                <EmptyState icon={History} title="Aucune action enregistrée pour l'instant" />
              </EmptyRow>
            )}
          </tbody>
        </Table>
      </TableCard>
    </div>
  );
}
