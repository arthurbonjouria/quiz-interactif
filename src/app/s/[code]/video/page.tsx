import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { VideoGate } from "@/components/quiz/VideoGate";
import { Logo } from "@/components/Logo";

export default async function CampaignVideoPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { attempt?: string };
}) {
  if (!searchParams.attempt) redirect(`/s/${params.code}`);

  const attempt = await prisma.attempt.findUnique({
    where: { id: searchParams.attempt },
    include: { campaign: true, answers: { select: { id: true }, take: 1 } },
  });

  if (!attempt || attempt.campaign.code !== params.code) notFound();

  if (attempt.finishedAt) {
    redirect(`/s/${params.code}/result/${attempt.id}`);
  }

  // Déjà en train de répondre (reprise après un rafraîchissement) : pas besoin de revoir la vidéo.
  if (attempt.answers.length > 0 || !attempt.campaign.videoUrl) {
    redirect(`/s/${params.code}/play?attempt=${attempt.id}`);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-ink px-6 py-10">
      <Logo variant="light" className="h-6" />
      <p className="text-sm text-white/70">Regardez la vidéo en entier pour débloquer le questionnaire</p>
      <VideoGate videoUrl={attempt.campaign.videoUrl} code={params.code} attemptId={attempt.id} />
    </main>
  );
}
