import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/require-admin";
import { generateAuditExportPdf, type AuditExportRow } from "@/lib/pdf/audit-export";

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

export async function GET() {
  const { response } = await requireOwner();
  if (response) return response;

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const rows: AuditExportRow[] = entries.map((e) => ({
    date: e.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
    who: e.actorName,
    action: ACTION_LABELS[e.action] ?? e.action,
    target: e.targetLabel,
    details: e.metadata ?? "",
  }));

  const pdf = await generateAuditExportPdf({
    generatedAt: new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" }),
    rows,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="journal-audit-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  });
}
