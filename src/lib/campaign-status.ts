export type CampaignStatus = "active" | "expired" | "inactive";

export function getCampaignStatus(campaign: { active: boolean; endsAt: Date | null }): CampaignStatus {
  if (!campaign.active) return "inactive";
  if (campaign.endsAt && campaign.endsAt.getTime() < Date.now()) return "expired";
  return "active";
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  expired: "Expirée",
  inactive: "Désactivée",
};
