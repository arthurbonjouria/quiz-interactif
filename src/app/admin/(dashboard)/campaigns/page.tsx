import Link from "next/link";
import { Target } from "lucide-react";
import { prisma } from "@/lib/db";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { LaunchLiveButton } from "@/components/admin/LaunchLiveButton";
import { getCampaignStatus, CAMPAIGN_STATUS_LABELS } from "@/lib/campaign-status";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TableCard, Table, Thead, Th, Tr, Td, EmptyRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_VARIANT: Record<string, "brand" | "neutral" | "danger"> = {
  active: "brand",
  expired: "neutral",
  inactive: "danger",
};

export default async function CampaignsPage() {
  const session = await auth();
  const owner = isOwner(session);

  const campaigns = await prisma.campaign.findMany({
    where: owner ? {} : { createdById: session?.user?.id },
    orderBy: { createdAt: "desc" },
    include: { questionnaire: true, company: true, _count: { select: { attempts: true } }, createdBy: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campagnes</h1>
          <p className="text-sm text-cloudy">
            Un questionnaire donné à une entreprise. Copiez le lien, ou lancez une session live.
          </p>
        </div>
        <LinkButton href="/admin/campaigns/new">+ Nouvelle campagne</LinkButton>
      </div>

      <TableCard>
        <Table>
          <Thead>
            <Th>Campagne</Th>
            <Th>Questionnaire</Th>
            <Th>Entreprise</Th>
            {owner && <Th>Formateur</Th>}
            <Th>Statut</Th>
            <Th>Participants</Th>
            <Th>Lien</Th>
            <Th />
          </Thead>
          <tbody>
            {campaigns.map((c) => {
              const status = getCampaignStatus(c);
              return (
                <Tr key={c.id}>
                  <Td className="font-semibold">{c.label}</Td>
                  <Td>{c.questionnaire.title}</Td>
                  <Td>
                    <Link href={`/admin/companies/${c.companyId}`} className="hover:text-brand hover:underline">
                      {c.company.name}
                    </Link>
                  </Td>
                  {owner && <Td className="text-cloudy">{c.createdBy?.name ?? "—"}</Td>}
                  <Td>
                    <Badge variant={STATUS_VARIANT[status]}>{CAMPAIGN_STATUS_LABELS[status]}</Badge>
                  </Td>
                  <Td>{c._count.attempts}</Td>
                  <Td>
                    <CopyLinkButton code={c.code} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      {status === "active" && <LaunchLiveButton campaignId={c.id} />}
                      <Link href={`/admin/campaigns/${c.id}`} className="text-sm font-semibold text-brand hover:underline">
                        Modifier
                      </Link>
                    </div>
                  </Td>
                </Tr>
              );
            })}
            {campaigns.length === 0 && (
              <EmptyRow colSpan={owner ? 8 : 7}>
                <EmptyState icon={Target} title="Aucune campagne pour l'instant" />
              </EmptyRow>
            )}
          </tbody>
        </Table>
      </TableCard>
    </div>
  );
}
