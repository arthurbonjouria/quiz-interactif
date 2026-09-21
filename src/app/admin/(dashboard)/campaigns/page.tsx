import Link from "next/link";
import { prisma } from "@/lib/db";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { LaunchLiveButton } from "@/components/admin/LaunchLiveButton";
import { getCampaignStatus, CAMPAIGN_STATUS_LABELS } from "@/lib/campaign-status";
import { auth } from "@/lib/auth";
import { isOwner } from "@/lib/require-admin";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  expired: "bg-neutral-200 text-neutral-600",
  inactive: "bg-red-100 text-red-700",
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
          <p className="text-sm text-neutral-500">
            Un questionnaire donné à une entreprise. Copiez le lien, ou lancez une session live.
          </p>
        </div>
        <Link href="/admin/campaigns/new" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-brand">
          + Nouvelle campagne
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Campagne</th>
              <th className="px-4 py-3">Questionnaire</th>
              <th className="px-4 py-3">Entreprise</th>
              {owner && <th className="px-4 py-3">Formateur</th>}
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Participants</th>
              <th className="px-4 py-3">Lien</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const status = getCampaignStatus(c);
              return (
                <tr key={c.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium">{c.label}</td>
                  <td className="px-4 py-3">{c.questionnaire.title}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/companies/${c.companyId}`} className="hover:underline">
                      {c.company.name}
                    </Link>
                  </td>
                  {owner && <td className="px-4 py-3 text-neutral-500">{c.createdBy?.name ?? "—"}</td>}
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[status]}`}>
                      {CAMPAIGN_STATUS_LABELS[status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c._count.attempts}</td>
                  <td className="px-4 py-3">
                    <CopyLinkButton code={c.code} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {status === "active" && <LaunchLiveButton campaignId={c.id} />}
                      <Link href={`/admin/campaigns/${c.id}`} className="text-brand hover:underline">
                        Modifier
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={owner ? 8 : 7} className="px-4 py-8 text-center text-neutral-400">
                  Aucune campagne pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
