import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";

const ACTION_LABELS: Record<string, string> = {
  "campaign.create": "Campagne créée",
  "campaign.update": "Campagne modifiée",
  "folder.create": "Dossier créé",
  "folder.invite": "Étudiants invités",
  "certificate.resend": "Certificat renvoyé",
  "team.create": "Formateur ajouté",
  "team.delete": "Formateur supprimé",
  "access_request.reject": "Demande d'accès refusée",
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
          <p className="text-sm text-neutral-500">
            Journal des actions effectuées sur la plateforme, pour votre suivi qualité (Qualiopi).
          </p>
        </div>
        <a
          href="/api/admin/audit/export"
          className="shrink-0 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand"
        >
          Export PDF
        </a>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Qui</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Concerne</th>
              <th className="px-4 py-3">Détails</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const metadata = e.metadata ? (JSON.parse(e.metadata) as Record<string, unknown>) : null;
              return (
                <tr key={e.id} className="border-t border-neutral-100 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-500">
                    {e.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3">{e.actorName}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-soft px-2 py-0.5 text-xs font-medium text-brand">
                      {ACTION_LABELS[e.action] ?? e.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">{e.targetLabel}</td>
                  <td className="max-w-xs px-4 py-3 text-xs text-neutral-400">
                    {metadata ? JSON.stringify(metadata) : ""}
                  </td>
                </tr>
              );
            })}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  Aucune action enregistrée pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
