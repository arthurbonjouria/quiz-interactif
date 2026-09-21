import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditCampaignForm } from "@/components/admin/EditCampaignForm";
import { VideoUploadField } from "@/components/admin/VideoUploadField";

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { questionnaire: true, company: true },
  });

  if (!campaign) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{campaign.label}</h1>
        <p className="text-sm text-neutral-500">
          {campaign.questionnaire.title} · {campaign.company.name}
        </p>
      </div>
      <EditCampaignForm
        campaign={{
          id: campaign.id,
          label: campaign.label,
          code: campaign.code,
          endsAt: campaign.endsAt ? campaign.endsAt.toISOString() : null,
          active: campaign.active,
        }}
      />
      <VideoUploadField campaignId={campaign.id} currentVideoUrl={campaign.videoUrl} />
    </div>
  );
}
