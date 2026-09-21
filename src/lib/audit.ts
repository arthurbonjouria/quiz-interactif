import { prisma } from "@/lib/db";

type AuditActor = { user?: { id?: string; name?: string | null } } | null | undefined;

export async function logAudit(params: {
  session?: AuditActor;
  action: string;
  targetType: string;
  targetId?: string;
  targetLabel: string;
  metadata?: Record<string, unknown>;
}) {
  const actorId = params.session?.user?.id ?? null;
  const actorName = params.session?.user?.name ?? "Système";

  await prisma.auditLog.create({
    data: {
      actorId,
      actorName,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      targetLabel: params.targetLabel,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
